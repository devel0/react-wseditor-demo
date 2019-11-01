import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Grid, TextField, Button, Typography, FormControlLabel, Checkbox, makeStyles } from '@material-ui/core';
import useDebounce from './debounce';
import { CSSProperties } from '@material-ui/styles';
import { WSEditor, WSEditorColumn, WSEditorCellEditor, SortDirection, WSEditorCellEditorText, WSEditorCellEditorNumber,
   WSEditorCellEditorBoolean, WSEditorSelectMode } from './react-wseditor/src';

interface MyData {
  col1: string,
  col2: string,
  col3: number,
  col4: boolean
}

const App: React.FC = () => {
  const [ROWS_COUNT, SET_GRID_SIZE] = useState(1200);
  const [EDITOR_WIDTH, SET_EDITOR_WIDTH] = useState(2000);
  const [EDITOR_100PC, SET_EDITOR_100PC] = useState(true);
  const [GRID_VIEW_ROWS, SET_GRID_VIEW_ROWS] = useState(5);
  const [SELECT_MODE_ROWS, SET_SELECT_MODE_ROWS] = useState(false);
  const [SELECT_MODE_MULTI, SET_SELECT_MODE_MULTI] = useState(true);
  const [FILTER, SET_FILTER] = useState("");
  const [rows, setRows] = useState<MyData[]>([]);
  const [filteredRows, setFilteredRows] = useState<MyData[]>([]);
  const [cols, setCols] = useState<WSEditorColumn<MyData>[]>([]);

  const q1 = useRef([] as MyData[]);
  const q2 = useRef([] as WSEditorColumn<MyData>[]);

  useEffect(() => {
    q1.current = [];

    // POPULATE DATA
    for (let i = 0; i < ROWS_COUNT; ++i) {
      q1.current.push({ col1: 'grp nr ' + Math.trunc(i / 10), col2: String.fromCharCode(65 + i % 24) + " " + i, col3: i, col4: true });      
    }
    setRows(q1.current);

    setFilteredRows(q1.current);

    q2.current = [
      {
        header: "viewrowidx (custom cell editor)",
        field: undefined,
        //maxWidth: "10%",        
        // custom cell editor inline        
        editor: (props, editor, viewCell) => new WSEditorCellEditor(props, editor, viewCell, (cellEditor) => {
          return <div>
            {viewCell.getCellCoord(editor.state.scrollOffset).rowIdx + 1}
          </div>
        }),
      },
      {
        header: "default cell",
        field: "col1",
        //maxWidth: "20%",
        sortDir: SortDirection.Descending,
        sortOrder: 0,
        // cellContainerStyle: { background: "yellow" },
        // editor: (props,editor,viewCell) => new WSEditorCellEditor(props,editor,viewCell, (cellEditor) => {
        //   return props.data
        // })
      },
      {
        header: "cell editor text",
        field: "col2",
        //maxWidth: "15%",
        sortDir: SortDirection.Descending,
        sortOrder: 1,
        sortFn: (a, b, dir) => {
          const aStrNum = a.col2.replace(/[^\d+]/g, "");
          const bStrNum = b.col2.replace(/[^\d+]/g, "");
          if (aStrNum.length > 0 && bStrNum.length > 0) {
            const va = parseInt(aStrNum);
            const vb = parseInt(bStrNum);
            const ascRes = va < vb ? -1 : 1;
            if (dir === SortDirection.Descending)
              return -ascRes;
            else
              return ascRes;
          }
          return a.col2 < b.col2 ? -1 : 1; // fallback str
        },
        editor: (props, editor, viewCell) => new WSEditorCellEditorText(props, editor, viewCell),
        // cellControlStyle: (editor, viewCell) => { return { textAlign: "center" } as CSSProperties },
      },
      {
        header: "cell editor number",
        field: "col3",
        //maxWidth: "15%",
        editor: (props, editor, viewCell) => new WSEditorCellEditorNumber(props, editor, viewCell),
      },
      {
        header: "cell editor boolean",
        field: "col4",
        //maxWidth: "40%",
        cellControlStyle: (editor, viewCell) => { return { marginLeft: "1em" } as CSSProperties },
        // justify: "flex-start",
        editor: (props, editor, viewCell) => new WSEditorCellEditorBoolean(props, editor, viewCell, {
          label: <Typography>lbl for row idx= {viewCell.getCellCoord(editor.state.scrollOffset).rowIdx}</Typography>,
          labelPlacement: "end",
        }),
      },
      {
        header: "cell boolean (default editor)",
        field: "col4",
        defaultEditor: "boolean"
      },
    ];
    setCols(q2.current);
  }, [ROWS_COUNT]);

  const useStyles = makeStyles({
    smallTextField: {
      width: 100
    },
    maginLeft1: {
      marginLeft: "1em"
    }
  });

  const classes = useStyles({});
  const editorRef = useRef<WSEditor<MyData>>(null);

  const debouncedFilter = useDebounce(FILTER, 500);

  useEffect(() => {
    if (debouncedFilter) {
      const filter = debouncedFilter;
      if (rows.length > 0) {
        const keys = Object.keys(rows[0]);
        const q = rows.filter((x) => {
          for (let ki = 0; ki < keys.length; ++ki) {
            const key = keys[ki];
            const fieldStr = String((x as any)[key]);
            const qSearch = fieldStr.indexOf(filter);
            if (qSearch >= 0) return true;
          }
          return false;
        }).slice();
        console.log(rows.length + " rows filtered to " + q.length);
        setFilteredRows(q);
      }
    }
    else if (rows.length > 0)
      setFilteredRows(rows);
  }, [debouncedFilter, rows]);

  return <div
    style={{
      position: "absolute",
      margin: 0, padding: 0,
      overflow: "auto",
      width: "100%", height: "100%",
    }}>
    <Grid container={true} direction="column" style={{ padding: "1em" }}>
      {/* TOOLBAR */}
      <Grid item={true}>

        <Grid container={true} direction="row">
          {/* ROWS COUNT */}
          <Grid item={true} xs="auto">
            <Typography>Rows count</Typography>
          </Grid>
          <Grid item={true} xs="auto" className={classes.maginLeft1}>
            <TextField className={classes.smallTextField} value={ROWS_COUNT} onChange={(v) => {
              const n = parseInt(v.target.value);
              if (!isNaN(n)) SET_GRID_SIZE(parseInt(v.target.value));
            }} />
          </Grid>

          {/* GRID VIEW ROWS */}
          <Grid item={true} xs="auto" className={classes.maginLeft1}>
            <Typography>Grid view rows</Typography>
          </Grid>
          <Grid item={true} xs="auto" className={classes.maginLeft1}>
            <TextField className={classes.smallTextField} value={GRID_VIEW_ROWS} onChange={(v) => {
              const n = parseInt(v.target.value);
              if (!isNaN(n)) SET_GRID_VIEW_ROWS(n);
            }} />
          </Grid>

          {/* FILTER */}
          <Grid item={true} xs="auto" className={classes.maginLeft1}>
            <Typography>Filter</Typography>
          </Grid>
          <Grid item={true} xs="auto" className={classes.maginLeft1}>
            <TextField className={classes.smallTextField} value={FILTER} onChange={(v) => SET_FILTER(v.target.value)} />
          </Grid>

          {/* SELECT MODE ROWS */}
          <Grid item={true} xs="auto" className={classes.maginLeft1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={SELECT_MODE_ROWS}
                  onChange={(v) => SET_SELECT_MODE_ROWS(v.target.checked)}
                  value="checkedF"
                />
              }
              label="Select mode rows"
            />
          </Grid>

          {/* SELECT MODE MULTI */}
          <Grid item={true} xs="auto">
            <FormControlLabel
              control={
                <Checkbox
                  checked={SELECT_MODE_MULTI}
                  onChange={(v) => SET_SELECT_MODE_MULTI(v.target.checked)}
                  value="checkedF"
                />
              }
              label="Select mode multi"
            />
          </Grid>
        </Grid>

        <Grid container={true} direction="row">
          {/* EDITOR WIDTH */}
          <Grid item={true} xs="auto">
            <Typography>Editor width</Typography>
          </Grid>
          <Grid item={true} xs="auto" className={classes.maginLeft1}>
            <TextField className={classes.smallTextField} value={EDITOR_WIDTH} onChange={(v) => {
              const n = parseInt(v.target.value);
              if (!isNaN(n)) SET_EDITOR_WIDTH(parseInt(v.target.value));
            }} />
          </Grid>

          {/* SELECT MODE MULTI */}
          <Grid item={true} xs="auto" className={classes.maginLeft1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={EDITOR_100PC}
                  onChange={(v) => SET_EDITOR_100PC(v.target.checked)}
                  value="checkedF"
                />
              }
              label="Editor width 100%"
            />
          </Grid>
        </Grid>
      </Grid>

      {/* BUTTONS */}
      <Grid item={true} xs={12}>
        <Grid container={true} direction="row">
          <Button color="primary" onClick={() => {
            if (editorRef.current) {
              const editor = editorRef.current;
              const newRowsCount = editor.props.rows.length + 1;
              const addedRowIdx = editor.addRow({ col1: "new row", col2: "", col3: 0, col4: false } as MyData);
              editor.scrollToRow(addedRowIdx, newRowsCount);
              editor.selectRow(addedRowIdx);
            }
          }}>add row</Button>
          <Button color="primary" onClick={() => {
            if (editorRef.current) {
              const editor = editorRef.current;
              editor.deleteRows(editor.selectedRows());
            }
          }}>delete rows</Button>
        </Grid>
      </Grid>

      {/* EDITOR */}
      <Grid item={true} xs={12}>
        <WSEditor
          ref={editorRef}
          rows={filteredRows} setRows={setFilteredRows}
          cols={cols} setCols={setCols}
          selectionMode={SELECT_MODE_ROWS ? WSEditorSelectMode.Row : WSEditorSelectMode.Cell}
          selectionModeMulti={SELECT_MODE_MULTI}
          debug={true}
          cellContainerHoverStyle={(editor, viewCell) => { return { background: "rgba(0,6,0,0.05)" } }}
          // headerCellStyle={(props) => { return { textDecoration: "underline" } }}
          // cellContainerStyle={(editor, viewCell) => { return { lineHeight: "2em" } }}
          // gridCellFocusedStyle={(editor, viewCell) => { return { border: SELECT_MODE_ROWS ? 0 : "1px solid rgba(56,90,162,0.8)" } }}
          // selectionStyle={(editor, viewCell) => { return { color: "red"} }}
          width={EDITOR_100PC ? "100%" : EDITOR_WIDTH}
          viewRowCount={GRID_VIEW_ROWS}
          onCellDataChanged={(editor, row, cell, data) => {
            // const q = row.col1; // typed row
            console.log("data changed on cell:" + cell + " data:" + data);
          }}
          onRowsAdded={(editor, rows) => {
            console.log(rows.length + " rows added");
          }}
          onRowsDeleted={(editor, rows) => {
            console.log(rows.length + " rows deleted");
          }}
        />
      </Grid>
    </Grid>

  </div>
}

export default App;
