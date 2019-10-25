import React, { useState, useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import { Grid, TextField, Button, Typography, FormControlLabel, Checkbox, createStyles, Theme, makeStyles } from '@material-ui/core';
import {
  WSEditor, WSEditorColumn, WSEditorCellEditor, WSEditorCellEditorText,
  WSEditorCellEditorNumber, WSEditorCellEditorBoolean, WSEditorSelectMode
} from 'react-wseditor';

interface MyData {
  col1: string,
  col2: string,
  col3: number,
  col4: boolean
}

const App: React.FC = () => {
  const [ROWS_COUNT, SET_GRID_SIZE] = useState(1200);
  const [GRID_VIEW_ROWS, SET_GRID_VIEW_ROWS] = useState(6);
  const [SELECT_MODE_ROWS, SET_SELECT_MODE_ROWS] = useState(false);
  const [FILTER, SET_FILTER] = useState("");
  const [rows, setRows] = useState<MyData[]>([]);
  const [filteredRows, setFilteredRows] = useState<MyData[]>([]);
  const [cols, setCols] = useState<WSEditorColumn<MyData>[]>([]);

  const q1: MyData[] = [];

  useEffect(() => {
    for (let i = 0; i < ROWS_COUNT; ++i) {
      q1.push({ col1: 'grp nr ' + Math.trunc(i / 10), col2: 'x' + i, col3: i, col4: true });
    }
    setRows(q1);
    setFilteredRows(q1);
    const q2: WSEditorColumn<MyData>[] = [
      {
        header: "R",
        field: "",
        editor: (props, editor, viewCell) => new WSEditorCellEditor(props, editor, viewCell, (cellEditor) => {
          return <>{viewCell.getCellCoord(editor.state.scrollOffset).rowIdx + 1}</>
        })
      },
      {
        header: "column 1 (text default)",
        field: "col1",
      },
      {
        header: "column 2 (text)",
        field: "col2",
        editor: (props, editor, viewCell) => new WSEditorCellEditorText(props, editor, viewCell),
      },
      {
        header: "column 3 (number)",
        field: "col3",
        editor: (props, editor, viewCell) => new WSEditorCellEditorNumber(props, editor, viewCell),
      },
      {
        header: "column 4 (boolean)",
        field: "col4",
        editor: (props, editor, viewCell) => new WSEditorCellEditorBoolean(props, editor, viewCell, {
          label: <Typography style={{ marginRight: "1em" }}>lbl for row idx= {viewCell.getCellCoord(editor.state.scrollOffset).rowIdx}</Typography>,
          labelPlacement: "start",
          textAlign: "center"
        }),
      },
    ];
    setCols(q2);
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
  }, [debouncedFilter]);

  return <div
    style={{
      position: "absolute",
      margin: 0, padding: 0,
      overflow: "hidden",
      width: "100%", height: "100%",
    }}>
    <div
      style={{
        border: "1px solid", borderStyle: "dashed",
        margin: "1em", padding: 0,
        width: "calc(100% - 2em)", height: "calc(100% - 2em)",
      }}>
      <Grid container={true} direction="column">
        <Grid item={true}>
          <Grid container={true} direction="row">
            <Grid item={true} xs="auto">
              <Typography>Rows count</Typography>
            </Grid>
            <Grid item={true} xs="auto" className={classes.maginLeft1}>
              <TextField className={classes.smallTextField} value={ROWS_COUNT} onChange={(v) => {
                const n = parseInt(v.target.value);
                if (!isNaN(n)) SET_GRID_SIZE(parseInt(v.target.value));
              }} />
            </Grid>
            <Grid item={true} xs="auto" className={classes.maginLeft1}>
              <Typography>Grid view rows</Typography>
            </Grid>
            <Grid item={true} xs="auto" className={classes.maginLeft1}>
              <TextField className={classes.smallTextField} value={GRID_VIEW_ROWS} onChange={(v) => {
                const n = parseInt(v.target.value);
                if (!isNaN(n)) SET_GRID_VIEW_ROWS(n);
              }} />
            </Grid>
            <Grid item={true} xs="auto" className={classes.maginLeft1}>
              <Typography>Filter</Typography>
            </Grid>
            <Grid item={true} xs="auto" className={classes.maginLeft1}>
              <TextField className={classes.smallTextField} value={FILTER} onChange={(v) => SET_FILTER(v.target.value)} />
            </Grid>
            <Grid item={true} xs="auto">
              <FormControlLabel
                className={classes.maginLeft1}
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
          </Grid>
        </Grid>
        <Grid item={true} xs={12}>
          <Grid container={true} direction="row">
            <Button color="primary" onClick={() => {
              if (editorRef.current) {
                const editor = editorRef.current;
                const newRowsCount = editor.props.rows.length + 1;
                const addedRowIdx = editor.addRow({ col1: "new row", col2: "", col3: 0, col4: false } as MyData, true);
                editor.scrollToRow(addedRowIdx, newRowsCount);
                editor.selectRow(addedRowIdx, newRowsCount);
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
        <Grid item={true} xs={12}>
          <WSEditor
            ref={editorRef}
            rows={filteredRows} setRows={setFilteredRows}
            cols={cols} setCols={setCols}
            selectionMode={SELECT_MODE_ROWS ? WSEditorSelectMode.Row : WSEditorSelectMode.Cell}
            selectionModeMulti={false}
            debug={true}
            viewRowCount={GRID_VIEW_ROWS}
            onCellDataChanged={(row, cell, data) => {
              const q = row.col1; // typed row
              console.log("data changed on row:" + JSON.stringify(row) + " cell:" + cell + " data:" + data);
            }}
          />
        </Grid>
      </Grid>
    </div>
  </div>
}

export default App;
