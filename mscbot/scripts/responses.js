const api_path = "https://bk8v326t6g.execute-api.us-east-1.amazonaws.com/default/sbf-infer";
var userInput;

function getBotResponse(input) {
  //rock paper scissors
  console.log("User input: ", input);
  if (input == "sup") {
    return "hola";
  }

  // Simple responses
  if (input == "hello") {
    return "Hello there!";
  } else if (input == "goodbye") {
    return "Talk to you later!";
  } else {
    userInput = input;
    body = JSON.stringify({ 'input': userInput });
    fetch(api_path, {
        method: 'POST',
        mode: 'cors',
        body: body,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, PUT, DELETE, GET, OPTIONS',
          'Access-Control-Request-Method': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Content-Type': 'application/json'
        }    
      }
    ).then(response => response.json()).then(res => {
      console.log(res);
      return res.output
    })
  }
}