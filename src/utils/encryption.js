import CryptoJS from 'crypto-js'

const SECRET_KEY = 'db-toolbox-secret-key-2024'

export const encryptData = (data) => {
  try {
    const jsonString = JSON.stringify(data)
    return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString()
  } catch (error) {
    console.error('암호화 오류:', error)
    return null
  }
}

export const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8)
    return JSON.parse(decryptedString)
  } catch (error) {
    console.error('복호화 오류:', error)
    return null
  }
}

export const setEncryptedItem = (key, data) => {
  const encrypted = encryptData(data)
  if (encrypted) {
    localStorage.setItem(key, encrypted)
  }
}

export const getEncryptedItem = (key) => {
  const encrypted = localStorage.getItem(key)
  if (!encrypted) return null
  return decryptData(encrypted)
}
