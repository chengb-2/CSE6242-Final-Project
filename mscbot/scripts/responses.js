const api_path = "https://bk8v326t6g.execute-api.us-east-1.amazonaws.com/default/sbf-infer";

async function getBotResponse(input, id) {
  //rock paper scissors
  console.log("User input: ", input);
  userInput = input;
  body = JSON.stringify({ 'input': userInput });
  const res = fetch(api_path, {
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
}