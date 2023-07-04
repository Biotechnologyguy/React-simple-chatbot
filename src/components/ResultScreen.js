import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "../ag-grid/ag-grid.css";
import "../ag-grid/ag-theme-alpine.css";


const ResultScreen = ({ matchedTrades, matchedStatements, title1, title2 }) => {
  

  const tradeColumnDefs = [
    { headerName: "CashFlow Id", field: "cashflowid" },
    { headerName: "Trade ID", field: "tradeid" },
    { headerName: "Spec ID", field: "specid" },
    { headerName: "source", field: "source" },
    { headerName: "Trader Name", field: "tradername" },
    { headerName: "Settlement ID", field: "settlementid" },
    { headerName: "Amount", field: "amount" },
    { headerName: "Counterparty", field: "counterparty" },
    { headerName: "Currency", field: "currency" },
  ];

  const statementColumnDefs = [
    { headerName: "Entry ID", field: "entryid" },
    { headerName: "Reference 1", field: "reference1" },
    { headerName: "Reference 2", field: "reference2" },
    { headerName: "Reference 3", field: "reference3" },
    { headerName: "Source", field: "source" },
    { headerName: "Amount", field: "amount" },
    { headerName: "Currency", field: "currency" },
  ];

  const defaultColDef = useMemo(()=>({
    sortable:true,
    filter:'textFilter',
    floatingFilter:true,
    enableRowGroup:true,
    enablePivot:true
  }),[]);

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div style={{ flex: 1 , width:"100vh"}}>
        <h2>{title1}</h2>
        <div
          className="ag-theme-alpine"
          style={{ height: "50vh", width: "100%" }}
        >
          <AgGridReact
            rowData={matchedTrades}
            columnDefs={tradeColumnDefs}
            pagination={true}
            defaultColDef={defaultColDef}
            rowSelection="multiple"
            animateRows={true}
            rowGroupPanelShow="always"
            enableCharts={true}
            enableRowGroup={true}
          ></AgGridReact>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <h2>{title2}</h2>
        <div
          className="ag-theme-alpine"
          style={{ height: "50vh", width: "100%" }}
        >
          <AgGridReact
            rowData={matchedStatements}
            columnDefs={statementColumnDefs}
            pagination={true}
          ></AgGridReact>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
