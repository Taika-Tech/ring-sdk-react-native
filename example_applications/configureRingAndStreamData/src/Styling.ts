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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  configButton: {
    backgroundColor: '#7F2FEB',
    width: 110,
  },
  container: {
    alignItems: 'center',
    backgroundColor: 'black',
    flex: 1,
    justifyContent: 'center',
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
  text: {
    color: 'white',
    fontSize: 25,
    marginBottom: 2,
  },
});

export default styling;
