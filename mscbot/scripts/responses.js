const api_path = "https://bk8v326t6g.execute-api.us-east-1.amazonaws.com/default/sbf-infer";
var userInput;
var response;

async function getBotResponse(input, id) {
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
          'Content-Type': 'application/json'
        }    
      }
    ).then(response => response.json()).then(res => {
      console.log(res.output);
      $("#response_" + id).text(res.output);
    });
    return 'loading';
  }
}