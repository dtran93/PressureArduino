     
// Flexiforce quick start example
// Reads A0 every 100ms and sends voltage value over serial

void setup() 
{
  // Start serial at 9600 baud
  Serial.begin(9600); 
}

    void loop() 
{
  // Read the input on analog pin 0:
  int sensorValue = analogRead(A0);
  
  // Convert the analog reading (which goes from 0 - 1023) to a voltage (0 - 5V):
  float voltage = sensorValue * (20.0 / 1023.0);
  
  // Print out the value you read:
//  Serial.print("B");
  String x = "B" + voltage +"E";
  Serial.println(x);
  
  // Wait 100 milliseconds
  delay(1000);
}

