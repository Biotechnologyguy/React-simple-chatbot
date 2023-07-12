import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import ChatBot from "react-simple-chatbot";
import tradeData from "../data/trade.json";
import statementData from "../data/statements.json";

import ResultScreen from "./ResultScreen";

const theme = {
  background: "#dde6ed",
  fontFamily: "Arial, Helvetica, sans-serif",
  headerBgColor: "#27374d",
  headerFontColor: "white",
  headerFontSize: "20pxpx",
  botBubbleColor: "#526d82",
  botFontColor: "wheite",
  userBubbleColor: "#9db2 ",
  userFontColor: "#4a4a4a",
};

const config = {
  floating: true,
  headerTitle: "BankBot",
  userDelay: 1000,
};

// Define options for the source menu
const sourceMenuOptions = [
  { value: "source1", label: "Source 1", trigger: "sourceSelected" },
  { value: "source2", label: "Source 2", trigger: "sourceSelected" },
  { value: "source3", label: "Source 3", trigger: "sourceSelected" },
  { value: "source4", label: "Source 4", trigger: "sourceSelected" },
  { value: "source5", label: "Source 5", trigger: "sourceSelected" },
  { value: "source6", label: "Source 6", trigger: "sourceSelected" },
  { value: "source7", label: "Source 7", trigger: "sourceSelected" },
  { value: "source8", label: "Source 8", trigger: "sourceSelected" },
];

const Chatbot = () => {
  const [amount, setAmount] = useState(null);
  const [matchedTrades, setMatchedTrades] = useState([]);
  const [matchedStatements, setMatchedStatements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // console.log(amount);
  }, [amount]);

  useEffect(() => {
    if (matchedTrades.length > 0 && matchedStatements.length > 0) {
      navigate("/results");
    }
  }, [matchedTrades, matchedStatements, navigate]);

  const handleAmountInput = (value) => {
    // Validate the input as a number
    const parsedAmount = parseFloat(value);

    if (isNaN(parsedAmount)) {
      // Invalid input, show an error message
      return "Please enter a valid number for the amount.";
    }

    // Store the amount
    setAmount(parsedAmount);
    return true;
  };

  const handleReferenceBasedMatch = () => {
    const matchedTrades = [];
    const matchedStatements = [];

    // Iterate over the trade and statement data to perform the matching
    tradeData.forEach((trade) => {
      statementData.forEach((statement) => {
        if (
          trade.source === statement.source &&
          trade.specid === statement.reference1
        ) {
          matchedTrades.push(trade);
          matchedStatements.push(statement);
        }
      });
    });

    // Set the matched data
    setMatchedTrades(matchedTrades);
    setMatchedStatements(matchedStatements);
  };

  const getUnmatchedTrades = () => {
    return tradeData.filter((trade) => !matchedTrades.includes(trade));
  };

  const getUnmatchedStatements = () => {
    return statementData.filter(
      (statement) => !matchedStatements.includes(statement)
    );
  };

  const handleAmountBasedMatch = () => {
    const updatedMatchedTrades = [];
    const updatedMatchedStatements = [];
    const unmatchedTrades = getUnmatchedTrades();
    const unmatchedStatements = getUnmatchedStatements();

    unmatchedTrades.forEach((trade) => {
      const matchingStatement = unmatchedStatements.find(
        (statement) =>
          trade.source === statement.source && trade.amount === statement.amount
      );

      if (matchingStatement) {
        updatedMatchedTrades.push(trade);
        updatedMatchedStatements.push(matchingStatement);
        unmatchedStatements.splice(
          unmatchedStatements.indexOf(matchingStatement),
          1
        );
      }
    });

    setMatchedTrades((prevMatchedTrades) => [
      ...prevMatchedTrades,
      ...updatedMatchedTrades,
    ]);
    setMatchedStatements((prevMatchedStatements) => [
      ...prevMatchedStatements,
      ...updatedMatchedStatements,
    ]);
  };

  const handleToleranceBasedMatch = (amount) => {
    const updatedMatchedTrades = [];
    const updatedMatchedStatements = [];
    const unmatchedTrades = getUnmatchedTrades();
    const unmatchedStatements = getUnmatchedStatements();

    unmatchedTrades.forEach((trade) => {
      const matchingStatement = unmatchedStatements.find(
        (statement) =>
          trade.source === statement.source &&
          trade.currency === statement.currency && // Add currency check
          Math.abs(trade.amount - statement.amount) <= amount
      );

      if (matchingStatement) {
        updatedMatchedTrades.push(trade);
        updatedMatchedStatements.push(matchingStatement);
        unmatchedStatements.splice(
          unmatchedStatements.indexOf(matchingStatement),
          1
        );
      }
    });

    setMatchedTrades((prevMatchedTrades) => [
      ...prevMatchedTrades,
      ...updatedMatchedTrades,
    ]);
    setMatchedStatements((prevMatchedStatements) => [
      ...prevMatchedStatements,
      ...updatedMatchedStatements,
    ]);
  };

  const handleNettedMatch = () => {
    const updatedMatchedTrades = [];
    const updatedMatchedStatements = [];
    const unmatchedTrades = getUnmatchedTrades();
    const unmatchedStatements = getUnmatchedStatements();

    const groupedTrades = {};

    // Group trades by source and settlementid
    unmatchedTrades.forEach((trade) => {
      const key = `${trade.source}-${trade.settlementid}`;
      if (groupedTrades[key]) {
        groupedTrades[key].push(trade);
      } else {
        groupedTrades[key] = [trade];
      }
    });

    // Match grouped trades with statements
    Object.values(groupedTrades).forEach((groupedTrade) => {
      const tradeTotalAmount = groupedTrade.reduce(
        (total, trade) => total + trade.amount,
        0
      );

      const matchingStatement = unmatchedStatements.find(
        (statement) =>
          statement.source === groupedTrade[0].source &&
          statement.settlementid === groupedTrade[0].settlementid &&
          statement.amount === tradeTotalAmount
      );

      if (matchingStatement) {
        updatedMatchedTrades.push(...groupedTrade);
        updatedMatchedStatements.push(matchingStatement);
        unmatchedStatements.splice(
          unmatchedStatements.indexOf(matchingStatement),
          1
        );
      }
    });

    setMatchedTrades((prevMatchedTrades) => [
      ...prevMatchedTrades,
      ...updatedMatchedTrades,
    ]);
    setMatchedStatements((prevMatchedStatements) => [
      ...prevMatchedStatements,
      ...updatedMatchedStatements,
    ]);
  };

  const steps = [
    {
      id: "1",
      message: "Please choose the Source Name:",
      trigger: "sourceMenu",
    },
    {
      id: "sourceMenu",
      options: sourceMenuOptions,
    },
    {
      id: "sourceSelected",
      message: "You have selected: {previousValue}",
      trigger: "ruleOptions",
    },
    {
      id: "ruleOptions",
      options: [
        {
          value: "Reference Based Match",
          label: "Reference Based Match",
          trigger: "referenceBasedMatch",
        },
      ],
    },
    {
      id: "referenceBasedMatch",
      message: "Performing Reference Based Match...",
      trigger: "processReferenceBasedMatch",
    },
    {
      id: "processReferenceBasedMatch",
      message: "Performing Reference Based Match...",
      trigger: () => {
        handleReferenceBasedMatch();
        return "displayResults";
      },
    },
    {
      id: "displayResults",
      message: "Matched trades and statements found!",
      trigger: "show-amt-based-netted-tolerance-msg",
    },
    {
      id: "show-amt-based-netted-tolerance-msg",
      message:
        "Based on history, you can achieve more match percentage by applying the following rules:",
      trigger: "show-amt-based-netted-tolerance-option",
    },
    {
      id: "show-amt-based-netted-tolerance-option",
      options: [
        {
          value: "Amount Based Match",
          label: "Amount Based Match",
          trigger: "amountBasedMatch",
        },
        {
          value: "Match With Tolerance",
          label: "Match With Tolerance",
          trigger: "toleranceBasedMatch-after-ref",
        },
        {
          value: "Netted Match",
          label: "Netted Match",
          trigger: "nettedmatch-after-ref",
        },
      ],
    },

    {
      id: "amountBasedMatch",
      message: "Performing Amount Based Match...",
      trigger: "processAmountBasedMatch",
    },
    {
      id: "processAmountBasedMatch",
      message: "Performing Amount Based Match...",
      trigger: () => {
        handleAmountBasedMatch();
        return "displayResultsAmountBased";
      },
    },
    {
      id: "displayResultsAmountBased",
      message: "Matched trades and statements found!",
      trigger: "show-netted-tolerance-msg",
    },
    {
      id: "show-netted-tolerance-msg",
      message:
        "You still have more rules to apply based on previous match history: ",
      trigger: "show-netted-tolerance-options",
    },
    {
      id: "show-netted-tolerance-options",
      options: [
        {
          value: "Match With Tolerance",
          label: "Match With Tolerance",
          trigger: "toleranceBasedMatch",
        },
        {
          value: "Netted Match",
          label: "Netted Match",
          trigger: "nettedmatch",
        },
      ],
    },
    //
    //
    //

    {
      id: "toleranceBasedMatch",
      message: "Please enter the amount:",
      trigger: "amountInput",
    },
    {
      id: "amountInput",
      user: true,
      validator: (value) => handleAmountInput(value),
      trigger: "perform-tolerance",
    },
    {
      id: "perform-tolerance",
      message: "Performing Tolerance Based Match...",
      trigger: "processToleranceBasedMatch",
    },
    {
      id: "processToleranceBasedMatch",
      message: "Performing Tolerance Based Match...",
      trigger: () => {
        handleToleranceBasedMatch(amount);
        return "displayResultsToleranceBased";
      },
    },
    {
      id: "displayResultsToleranceBased",
      message: "Matched trades and statements found!",
      trigger: "show-amount-netted-msg",
    },
    {
      id: "show-amount-netted-msg",
      message:
        "You still have more rules to apply based on previous match history:",
      trigger: "show-netted-option",
    },
    {
      id: "show-netted-option",
      options: [
        {
          value: "Netted Match",
          label: "Netted Match",
          trigger: "nettedmatch",
        },
      ],
    },
    {
      id: "nettedmatch",
      message: "Performing Netted Match...",
      trigger: "processNettedMatch",
    },
    {
      id: "processNettedMatch",
      message: "Performing Netted Match...",
      trigger: () => {
        handleNettedMatch();
        return "displayResultsNettedMatch";
      },
    },
    {
      id: "displayResultsNettedMatch",
      message: "Matched trades and statements found!",
      trigger: "end",
    },



// tolerance based selected After reference based: 

{
  id: "toleranceBasedMatch-after-ref",
  message: "Please enter the amount:",
  trigger: "amountInput2",
},
{
  id: "amountInput2",
  user: true,
  validator: (value) => handleAmountInput(value),
  trigger: "perform-tolerance2",
},
{
  id: "perform-tolerance2",
  message: "Performing Tolerance Based Match...",
  trigger: "processToleranceBasedMatch2",
},
{
  id: "processToleranceBasedMatch2",
  message: "Performing Tolerance Based Match...",
  trigger: () => {
    handleToleranceBasedMatch(amount);
    return "displayResultsToleranceBased2";
  },
},
{
  id: "displayResultsToleranceBased2",
  message: "Matched trades and statements found!",
  trigger: "show-amount-netted-msg2",
},
{
  id: "show-amount-netted-msg2",
  message:
    "You still have more rules to apply based on previous match history: ",
  trigger: "show-amount-netted-options2",
},
{
  id: "show-amount-netted-options2",
  options: [
    {
      value: "Amount Based Match",
      label: "Amount Based Match",
      trigger: "amountBasedMatch2",
    },
    {
      value: "Netted Match",
      label: "Netted Match",
      trigger: "nettedmatch2",
    },
  ],
},


// Amount based match selected after tolerance based : 
{
  id: "amountBasedMatch2",
  message: "Performing Amount Based Match...",
  trigger: "processAmountBasedMatch2",
},
{
  id: "processAmountBasedMatch2",
  message: "Performing Amount Based Match...",
  trigger: () => {
    handleAmountBasedMatch();
    return "displayResultsAmountBased2";
  },
},
{
  id: "displayResultsAmountBased2",
  message: "Matched trades and statements found!",
  trigger: "show-netted-msg2",
},
{
  id: "show-netted-msg2",
  message:
    "You still have more rules to apply based on previous match history: ",
  trigger: "show-netted-option2",
},
{
  id: "show-netted-option2",
  options: [
    {
      value: "Netted Match",
      label: "Netted Match",
      trigger: "nettedmatch2",
    },
  ],

  
},
{
  id: "nettedmatch2",
  message: "Performing Netted Match...",
  trigger: "processNettedMatch2",
},
{
  id: "processNettedMatch2",
  message: "Performing Netted Match...",
  trigger: () => {
    handleNettedMatch();
    return "displayResultsNettedMatch2";
  },
},
{
  id: "displayResultsNettedMatch2",
  message: "Matched trades and statements found!",
  trigger: "end",
},

// Selected netted match after reference based match
{
  id: "nettedmatch-after-ref",
  message: "Performing Amount Based Match...",
  trigger: "processAmountBasedMatch-after-ref",
},
{
  id: "processAmountBasedMatch-after-ref",
  message: "Performing Amount Based Match...",
  trigger: () => {
    handleAmountBasedMatch();
    return "displayResultsAmountBased-after-ref";
  },
},
{
  id: "displayResultsAmountBased-after-ref",
  message: "Matched trades and statements found!",
  trigger: "show-netted-tolerance-msg-after-ref",
},
{
  id: "show-netted-tolerance-msg-after-ref",
  message:
    "You still have more rules to apply based on previous match history: ",
  trigger: "show-netted-tolerance-options-after-ref",
},
{
  id: "show-netted-tolerance-options-after-ref",
  options: [
    {
      value: "Amount Based Match",
      label: "Amount Based Match",
      trigger: "amountBasedMatch-after-ref-netted",
    },
    {
      value: "Match With Tolerance",
      label: "Match With Tolerance",
      trigger: "toleranceBasedMatch",
    },
  ],
},
{
  id: "amountBasedMatch-after-ref-netted",
  message: "Performing Amount Based Match...",
  trigger: "processAmountBasedMatch-after-ref-netted",
},
{
  id: "processAmountBasedMatch-after-ref-netted",
  message: "Performing Amount Based Match...",
  trigger: () => {
    handleAmountBasedMatch();
    return "displayResultsAmountBased-after-ref-netted";
  },
},
{
  id: "displayResultsAmountBased-after-ref-netted",
  message: "Matched trades and statements found!",
  trigger: "show-netted-msg-after-ref-netted",
},
{
  id: "show-netted-msg-after-ref-netted",
  message:
    "You still have more rules to apply based on previous match history: ",
  trigger: "show-tolerance-option-after-ref-netted-amount",
},
{
  id: "show-tolerance-option-after-ref-netted-amount",
  options: [
    {
      value: "Match With Tolerance",
      label: "Match With Tolerance",
      trigger: "toleranceBasedMatch-after-ref-netted-amount",
    },
  ],
},

{
  id: "toleranceBasedMatch-after-ref-netted-amount",
  message: "Please enter the amount:",
  trigger: "amountInput-after-ref-netted-amount",
},
{
  id: "amountInput-after-ref-netted-amount",
  user: true,
  validator: (value) => handleAmountInput(value),
  trigger: "perform-tolerance-after-ref-netted-amount",
},
{
  id: "perform-tolerance-after-ref-netted-amount",
  message: "Performing Tolerance Based Match...",
  trigger: "processToleranceBasedMatch-after-ref-netted-amount",
},
{
  id: "processToleranceBasedMatch-after-ref-netted-amount",
  message: "Performing Tolerance Based Match...",
  trigger: () => {
    handleToleranceBasedMatch(amount);
    return "displayResultsToleranceBased-after-ref-netted-amount";
  },
},
{
  id: "displayResultsToleranceBased-after-ref-netted-amount",
  message: "Matched trades and statements found!",
  trigger: "end",
},

//
//
//

    {
      id: "end",
      message: "Thank you for using BankBot!",
      end: true,
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <ChatBot steps={steps} {...config} />
      {matchedTrades.length > 0 && matchedStatements.length > 0 ? (
        <ResultScreen
          matchedTrades={matchedTrades}
          matchedStatements={matchedStatements}
          unmatchedTrades={getUnmatchedTrades()}
          unmatchedStatements={getUnmatchedStatements()}
        />
      ) : (
        <ResultScreen
          matchedTrades={[]}
          matchedStatements={[]}
          unmatchedTrades={tradeData}
          unmatchedStatements={statementData}
        />
      )}
    </ThemeProvider>
  );
};

export default Chatbot;
