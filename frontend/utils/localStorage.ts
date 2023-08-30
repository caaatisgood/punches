const localStorage = {
  getItem: (key: string) =>
    typeof window !== "undefined" && window.localStorage.getItem(`punches__${key}`),
  setItem: (key: string, value: string) => {
    typeof window !== "undefined" && window?.localStorage.setItem(`punches__${key}`, value)
  },
  removeItem: (key: string) => {
    typeof window !== "undefined" && window?.localStorage.removeItem(`punches__${key}`)
  },
}

export default localStorage
