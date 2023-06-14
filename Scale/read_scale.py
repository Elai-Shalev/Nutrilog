import serial

# After Changing the logic to wifi based connections - 
# change port and logic accordingly
# Define the serial port parameters
port = "COM10"
baudrate = 57600

# Open the serial port
ser = serial.Serial(port, baudrate)


# Read data from the serial port
while True:
    data = ser.readline()
    print(data.decode('Ascii'))
    
# Close the serial port
ser.close()