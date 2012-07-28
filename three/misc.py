"""
Miscellaneous functions.
"""

import os, tempfile, socket
from StringIO import StringIO
import urllib, urllib2

import gc

from urllib2 import URLError

def get(url, data=None, timeout=10):
    # todo: rewrite using with
    old_timeout = socket.getdefaulttimeout()
    socket.setdefaulttimeout(timeout)
    try:
        if data is not None:
            url = url + '?' + urllib.urlencode(data)
        return urllib2.urlopen(url).read()
    finally:
        socket.setdefaulttimeout(old_timeout)

def post(url, data=None, timeout=10):
    # todo: rewrite using with
    old_timeout = socket.getdefaulttimeout()
    socket.setdefaulttimeout(timeout)
    try:
        if data is None: data = {}
        data = urllib.urlencode(data)
        req = urllib2.Request(url, data)
        response = urllib2.urlopen(req)        
        return response.read()
    finally:
        socket.setdefaulttimeout(old_timeout)

def all_files(path):
    """
    Return a sorted list of the names of all files in the given path, and in
    all subdirectories.  Empty directories are ignored.

    INPUT:

    - ``path`` -- string

    EXAMPLES::

    We create 3 files: a, xyz.abc, and m/n/k/foo.  We also create a
    directory x/y/z, which is empty::

        >>> import tempfile
        >>> d = tempfile.mkdtemp()
        >>> o = open(os.path.join(d,'a'),'w')
        >>> o = open(os.path.join(d,'xyz.abc'),'w')
        >>> os.makedirs(os.path.join(d, 'x', 'y', 'z'))
        >>> os.makedirs(os.path.join(d, 'm', 'n', 'k'))
        >>> o = open(os.path.join(d,'m', 'n', 'k', 'foo'),'w')

    This all_files function returns a list of the 3 files, but
    completely ignores the empty directory::
    
        >>> all_files(d)       # ... = / on unix but \\ windows
        ['a', 'm...n...k...foo', 'xyz.abc']
        >>> import shutil; shutil.rmtree(d)       # clean up mess
    """
    all = []
    n = len(path)
    for root, dirs, files in os.walk(path):
        for fname in files:
            all.append(os.path.join(root[n+1:], fname))
    all.sort()
    return all


_temp_prefix = None
def is_temp_directory(path):
    """
    Return True if the given path is likely to have been
    generated by the tempfile.mktemp function.

    EXAMPLES::

        >>> import tempfile
        >>> is_temp_directory(tempfile.mktemp())
        True
        >>> is_temp_directory(tempfile.mktemp() + '../..')
        False
    """
    global _temp_prefix
    if _temp_prefix is None:
        _temp_prefix = os.path.split(tempfile.mktemp())[0]
    path = os.path.split(os.path.abspath(path))[0]
    return os.path.samefile(_temp_prefix, path)


######################################################################

def randint_set(i, j, n):
    """
    Return a set of n distinct randomly chosen integers in the closed
    interval [i,j].

    EXAMPLES::
    
        >>> import random; random.seed(0)
        >>> randint_set(5, 10, 3)
        set([9, 10, 7])
        >>> randint_set(5, 10, 6)
        set([5, 6, 7, 8, 9, 10])
        >>> randint_set(5, 10, 7)
        Traceback (most recent call last):
        ...
        ValueError: there is no such set    
    """
    import random
    if j-i+1 == n:
        return set(range(i,j+1))
    if j-i+1 < n:
        raise ValueError, "there is no such set"
    v = set([random.randint(i,j)])
    while len(v) < n:
        v.add(random.randint(i,j))
    return v



######################################################################

def userstring_to_list(s):
    """
    Given a string s, set the global variable workers.  The string s should
    be something of the form: 'sagewsworker,sagews_worker_1-100, userfoo_5'
    Thus:
         - whitespace is ignored
         - it is separated by commas
         - a dash between two integers represents several distinct
           accounts, e.g., foo1-3 means foo1,foo2,foo3; this dash must
           be at the end of the name.

    This is in misc, since it's conceivable that this expansion will
    have to be done in various places.
    """
    # get rid of whitespace
    s = ''.join(s.split())
    # split on commas
    v = s.split(',')
    # expand ranges
    w = []
    for user in v:
        u = user
        i = user.rfind('-')
        if i != -1:
            j = i-1
            while j>=0 and user[j].isdigit():
                j -= 1
            if j < i-1: # at least one digit to left
                k = i+1
                while k<len(user) and user[k].isdigit():
                    k += 1
                if k > i+1: # at least one digit to right
                    u = None
                    for n in range(int(user[j+1:i]), int(user[i+1:k])+1):
                        w.append(user[:j+1] + str(n))
        if u is not None: w.append(u)        
    return w


def is_running(pid):
    """Return True only if the process with given pid is running."""
    try:
        os.kill(pid,0)
        return True
    except:
        return False
