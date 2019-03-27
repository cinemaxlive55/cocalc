import * as React from "react";
import * as immutable from "immutable";
import {
  AutoSizer,
  List,
  CellMeasurer,
  CellMeasurerCache
} from "react-virtualized";

const misc = require("smc-util/misc");
const { Col } = require("react-bootstrap");
const { VisibleMDLG } = require("../../r_misc");

import { ProjectActions } from "../../project_actions";
import { AppRedux } from "../../app-framework";

import { NoFiles } from "./no-files";
// import { FirstSteps } from "./first-steps";
import { TerminalModeDisplay } from "./terminal-mode-display";
import { ListingHeader } from "./listing-header";
import { DirectoryRow } from "./directory-row";
import { FileRow } from "./file-row";
import { TERM_MODE_CHAR } from "./utils";

const test_data = [
  ["1, 2, 3, 10"],
  ["1, 2, 3, 10"],
  ["1, 2, 3, 10"],
  ["1, 2, 3, 10"],
  ["1, 2, 3, 10"],
  ["1, 2, 3, 10"],
  ["1, 2, 3, 10"],
  ["1, 2, 3, 10"],
  ["1, 2, 3, 10"],
  ["1, 2, 3, 10"],
  ["1, 2, 3, 10"],
  ["1, 2, 3, 10"],
  ["1, 2, 3, 10"],
  ["1, 2, 3, 10"],
  ["1, 2, 3, 10"],
  ["1, 2, 3, 10"],
  ["1, 2, 3, 10"],
  ["1, 2, 3, 10"],
  ["1, 2, 3, 10"]
];
interface Props {
  // TODO: everything but actions/redux should be immutable JS data, and use shouldComponentUpdate
  actions: ProjectActions;
  redux: AppRedux;

  active_file_sort?: any;
  listing: any[];
  file_map: object;
  file_search: string;
  checked_files: immutable.Set<string>;
  current_path: string;
  page_number: number;
  page_size: number;
  public_view: boolean;
  create_folder: () => void; // TODO: should be action!
  create_file: () => void; // TODO: should be action!
  selected_file_index: number;
  project_id: string;
  shift_is_down: boolean;
  sort_by: (heading: string) => void; // TODO: should be data
  library: object;
  other_settings?: immutable.Map<any, any>;
  show_new: boolean;
}

export class FileListing extends React.Component<Props> {
  static defaultProps = { file_search: "" };

  private cache: CellMeasurerCache;

  constructor(props) {
    super(props);

    this.cache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 50
    });
  }

  render_cached_row_at = ({ index, key, parent, style }) => {
    function render_row(i) {
      return <div style={style}>{test_data[i]}</div>;
    }
    /*
    const a = this.props.listing[index];
    const row = this.render_row(
      a.name,
      a.size,
      a.mtime,
      a.mask,
      a.isdir,
      a.display_name,
      a.public,
      a.issymlink,
      index,
      style
    );
    */
    return (
      <CellMeasurer
        cache={this.cache}
        columnIndex={0}
        key={key}
        rowIndex={index}
        parent={parent}
      >
        {render_row(index)}
      </CellMeasurer>
    );
  };

  render_row(
    name,
    size,
    time,
    mask,
    isdir,
    display_name,
    public_data,
    issymlink,
    index,
    style?
  ) {
    let color;
    const checked = this.props.checked_files.has(
      misc.path_to_file(this.props.current_path, name)
    );
    const { is_public } = this.props.file_map[name];
    if (checked) {
      if (index % 2 === 0) {
        color = "#a3d4ff";
      } else {
        color = "#a3d4f0";
      }
    } else if (index % 2 === 0) {
      color = "#eee";
    } else {
      color = "white";
    }
    const apply_border =
      index === this.props.selected_file_index &&
      this.props.file_search[0] !== TERM_MODE_CHAR;
    if (isdir) {
      return (
        <DirectoryRow
          name={name}
          display_name={display_name}
          time={time}
          size={size}
          issymlink={issymlink}
          key={index}
          color={color}
          bordered={apply_border}
          mask={mask}
          public_data={public_data}
          is_public={is_public}
          checked={checked}
          current_path={this.props.current_path}
          actions={this.props.actions}
          no_select={this.props.shift_is_down}
          public_view={this.props.public_view}
          style={style}
        />
      );
    } else {
      return (
        <FileRow
          name={name}
          display_name={display_name}
          time={time}
          size={size}
          issymlink={issymlink}
          color={color}
          bordered={apply_border}
          mask={mask}
          public_data={public_data}
          is_public={is_public}
          checked={checked}
          key={index}
          current_path={this.props.current_path}
          actions={this.props.actions}
          no_select={this.props.shift_is_down}
          public_view={this.props.public_view}
          style={style}
        />
      );
    }
  }

  render_rows1() {
    return (
      <AutoSizer className="autosizer-wrapper">
        {({ height, width }) => (
          <List
            ref="List"
            className={"none"}
            deferredMeasurementCache={this.cache}
            height={height || 200}
            overscanRowCount={2}
            rowCount={test_data.length || this.props.listing.length}
            rowHeight={this.cache.rowHeight}
            rowRenderer={this.render_cached_row_at}
            width={width || 1200}
          />
        )}
      </AutoSizer>
    );
  }

  render_rows() {
    return this.props.listing.map((a, i) =>
      this.render_row(
        a.name,
        a.size,
        a.mtime,
        a.mask,
        a.isdir,
        a.display_name,
        a.public,
        a.issymlink,
        i
      )
    );
  }

  render_no_files() {
    if (this.props.show_new) {
      return;
    }
    if (this.props.listing.length !== 0) {
      return;
    }
    if (this.props.file_search[0] === TERM_MODE_CHAR) {
      return;
    }
    return (
      <NoFiles
        current_path={this.props.current_path}
        actions={this.props.actions}
        public_view={this.props.public_view}
        file_search={this.props.file_search}
        create_folder={this.props.create_folder}
        create_file={this.props.create_file}
        project_id={this.props.project_id}
      />
    );
  }

  render_first_steps() {
    return; // See https://github.com/sagemathinc/cocalc/issues/3138
    /*
    const name = "first_steps";
    if (this.props.public_view) {
      return;
    }
    if (!this.props.library[name]) {
      return;
    }
    let setting: string | undefined;
    if (this.props.other_settings !== undefined) {
      setting = (this.props.other_settings as any).get(name)
    }
    if (!setting) {
      return;
    }
    if (this.props.current_path !== "") {
      return;
    } // only show in $HOME
    if (
      this.props.file_map[name] != null
        ? this.props.file_map[name].isdir
        : undefined
    ) {
      return;
    } // don't show if we have it ...
    if (this.props.file_search[0] === TERM_MODE_CHAR) {
      return;
    }

    return <FirstSteps actions={this.props.actions} redux={this.props.redux} />;
    */
  }

  render_terminal_mode() {
    if (this.props.file_search[0] === TERM_MODE_CHAR) {
      return <TerminalModeDisplay />;
    }
  }

  render() {
    return (
      <>
        <Col sm={12} style={{ zIndex: 1, display: "flex", flexDirection: "column" }}>
          {!this.props.public_view ? this.render_terminal_mode() : undefined}
          {this.props.listing.length > 0 ? (
            <ListingHeader
              active_file_sort={this.props.active_file_sort}
              sort_by={this.props.sort_by}
            />
          ) : (
            undefined
          )}
          <div style={{ flex: '1 1 auto' }}>
            {this.render_rows1()}
          </div>
          {this.render_no_files()}
        </Col>
        <VisibleMDLG>{this.render_first_steps()}</VisibleMDLG>
      </>
    );
  }
}
