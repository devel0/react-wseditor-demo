import React, { useState, useEffect } from "react";
import Chance from 'chance';

import { WSEditor, WSEditorColumn } from 'react-wseditor';

interface MyData {
    name: string;
    value1: number;
    value2: number;
    value3: number;
}

export default function MyComponent() {
    const [rows, setRows] = useState<MyData[]>([]);
    const [cols, setCols] = useState<WSEditorColumn<MyData>[]>([]);

    const SIZE_TEST = 10000;

    useEffect(() => {
        setCols([
            { header: "name", field: "name", defaultEditor: "text" },
            { header: 'value1', field: 'value1', defaultEditor: "number" },
            { header: 'value2', field: 'value2', defaultEditor: "number" },
            { header: 'value3', field: 'value3', defaultEditor: "number" },
        ]);

        const r: MyData[] = [];
        const chance = new Chance();
        for (let i = 0; i < SIZE_TEST; ++i) {
            r.push({
                name: chance.word(),
                value1: chance.minute(),
                value2: chance.floating({ min: 0, max: 1e6, fixed: 4 }),
                value3: chance.floating({ min: 0, max: 1e9, fixed: 2 })
            });
        }
        setRows(r);
    }, []);

    return <WSEditor
        debug={true}
        viewRowCount={6}
        rows={rows} setRows={setRows}
        cols={cols} setCols={setCols} />
}
