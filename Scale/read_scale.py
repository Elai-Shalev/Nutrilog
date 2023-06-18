def main():
        
    import serial

    # After Changing the logic to wifi based connections - 
    # change port and logic accordingly
    # Define the serial port parameters
    port = "COM10"
    baudrate = 57600

    # Open the serial port
    ser = serial.Serial(port, baudrate)

    i = 0
    # Read data from the serial port
    while i < 1000:
        data = ser.readline()
        print(data.decode('Ascii'))
        print(type(data.decode('Ascii')))
        i+=1
        
    # Close the serial port
    ser.close() 

if __main__ == "__main__":
    main()
