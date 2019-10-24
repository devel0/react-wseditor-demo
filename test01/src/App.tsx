import { useState, useEffect, useRef } from "react";
import React from "react";
import { Grid, TextField, Button, Typography, FormControlLabel, Checkbox, createStyles, Theme, makeStyles } from '@material-ui/core';

import {
  WSEditor,
  WSEditorColumn, WSEditorCellEditorText, WSEditorCellEditorProps,
  WSEditorViewCellCoord, WSEditorCellEditorNumber, WSEditorCellEditorBoolean, WSEditorSelectMode
} from "react-wseditor";

interface MyData {
  col1: string,
  col2: string,
  col3: number,
  col4: boolean
}

export default function App() {
  const [ROWS_COUNT, SET_GRID_SIZE] = useState(12);
  const [GRID_VIEW_ROWS, SET_GRID_VIEW_ROWS] = useState(6);
  const [SELECT_MODE_ROWS, SET_SELECT_MODE_ROWS] = useState(false);
  const [rows, setRows] = useState<MyData[]>([]);
  const [cols, setCols] = useState<WSEditorColumn<MyData>[]>([]);

  const q1: MyData[] = [];

  useEffect(() => {
    for (let i = 0; i < ROWS_COUNT; ++i) {
      q1.push({ col1: 'grp nr ' + Math.trunc(i / 10), col2: 'x' + i, col3: i, col4: true });
    }
    setRows(q1);
    const q2: WSEditorColumn<MyData>[] = [
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
        editor: (props, editor, viewCell) => new WSEditorCellEditorBoolean(props, editor, viewCell),
      },
    ];
    setCols(q2);
  }, [ROWS_COUNT]);

  const useStyles = makeStyles({
    smallTextField: {
      width: 50
    },
    maginLeft1: {
      marginLeft: "1em"
    }
  });

  const classes = useStyles({});
  const editorRef = useRef<WSEditor<MyData>>(null);

  return <>
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
          <Grid item={true} xs="auto">
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
          rows={rows} setRows={setRows}
          cols={cols} setCols={setCols}
          selectionMode={SELECT_MODE_ROWS ? WSEditorSelectMode.Row : WSEditorSelectMode.Cell}
          viewRowCount={GRID_VIEW_ROWS}
          outlineCell={false}
        />
      </Grid>
    </Grid>
  </>
}