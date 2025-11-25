import { StyleSheet } from 'react-native';

export const GlobalStyles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  loginContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  navHeaderSm: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    justifyContent: 'space-between',
  },
  navTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flexDirection: 'row',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inputSm: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
  },
  inputMd: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  btnSuccess: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12,
  },
  btnPrimary: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  flexActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {

    justifyContent: "center",
    alignItems: "center",
    flex : 1
  },
  emptyText: {
    fontSize: 16,
    color: "#675b5bff",
    textAlign: "center",
  },
});
