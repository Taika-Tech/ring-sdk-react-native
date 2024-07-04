import { Dimensions, StyleSheet } from 'react-native';

const styling = StyleSheet.create({
  alignRight: {
    textAlign: "right"
  },
  button: {
    alignSelf: 'center',
    backgroundColor: '#7F2FEB',
    borderRadius: 5,
    marginTop: 20,
    paddingVertical: 10,
    width: 110,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  column1: {
    color: "white",
    fontSize: 18,
    width: 40,
  },
  column1Text: {
    textAlign: "right",
  },
  column2: {
    width: 62,
  },
  column3: {
    width: 18,
  },
  column3Text: {
    textAlign: "center",
  },
  column4: {
    fontSize: 18,
    width: 36,
  },
  container: {
    alignItems: 'center',
    backgroundColor: 'black',
    flex: 1,
    justifyContent: 'center',
  },
  dataValue: {
    color: '#7F2FEB',
    fontWeight: 'bold',
  },
  dot: {
    backgroundColor: '#7F2FEB',
    borderRadius: 5,
    height: 10,
    position: 'absolute',
    width: 10,
  },
  h1: {
    color: 'white',
    fontSize: 26,
    marginBottom: 25,
    textAlign: 'center',
  },
  h2: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: "center",
  },
  logo: {
    aspectRatio: 1677 / 291,
    height: 20,
    position: 'absolute',
    top: 20,
    width: undefined,
  },
  pageContainer: {
    flexDirection: "row",
  },
  pageSection: {
    marginVertical: 15,
  },
  smallMarginRight: {
    marginRight: 40,
  },
  table: {
    flexDirection: 'column',
    width: 130,
  },
  tableCell: {
    color: "white",
    fontSize: 18,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: "flex-end",
    paddingVertical: 5,
  },
  text: {
    color: 'white',
    fontSize: 25,
    marginBottom: 2,
  },
  touchPad: {
    borderColor: 'white',
    borderWidth: 1,
    position: 'relative',
  },
});

export default styling;
