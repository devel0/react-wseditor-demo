import React from 'react';

import MyComponent from './MyComponent';

const App: React.FC = () => {
  return <div>
    <div style={{ margin: "1em" }}>
      <ul style={{ lineHeight: "2" }}>
        <li><b>colum header</b> : click to sort ( hold shift for multisort )</li>
        <li><b>direct cell edit</b> : type on a cell to direct edit ( thanks to <i>defaultEditor</i> specified else would readonly ) then use arrow to move other cell or type enter to leave edit; if use F2 focus still even if use arrows</li>
        <li><b>movement</b> : use arrows to move or home/end with/without ctrl</li>
        <li><b>selection</b> : click on a cell then to ending cell holding shift ; hold ctrl for multiple select</li>
      </ul>      
      <MyComponent />
    </div>
  </div>
}

export default App;
