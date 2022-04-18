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
    return "Try sending a sentence!";
  }
}
