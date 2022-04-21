const api_path = "https://wuqxv7gtdd.execute-api.us-east-1.amazonaws.com/default/sbf-infer";
const api_key = "ShufLKMXDa6398N62C5Gi8YYnsoAh8rJa2uKuwwv";

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
    return userInput(input);
  }
}

const userInput = async (input) => {
  const response = await fetch(api_path, {
    method: 'POST',
    body: {
      input: input
    },
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': api_key
    }
  });
  const res = await response.json(); //extract JSON from the http response
  console.log(res)
  // do something with myJson
  return res.output;
}
