import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

export const api = {
  getInputFiles: async () => {
    const response = await axios.get(`${API_BASE}/input/files`)
    return response.data
  },

  getInputFile: async (filename) => {
    const response = await axios.get(`${API_BASE}/input/${filename}`)
    return response.data
  },

  updateInputFile: async (filename, content) => {
    const response = await axios.post(`${API_BASE}/input/${filename}`, {
      filename,
      content,
    })
    return response.data
  },

  runORE: async () => {
    const response = await axios.post(`${API_BASE}/run`)
    return response.data
  },

  getResults: async () => {
    const response = await axios.get(`${API_BASE}/results`)
    return response.data
  },

  resetInputFiles: async () => {
    const response = await axios.post(`${API_BASE}/input/reset`)
    return response.data
  },

  getConfig: async () => {
    const response = await axios.get(`${API_BASE}/config`)
    return response.data
  },

  getFREDRates: async (seriesIds) => {
    if (!seriesIds || seriesIds.length === 0) {
      const response = await axios.get(`${API_BASE}/fred/rates`)
      return response.data
    }

    // Build URL with multiple series parameters
    const params = new URLSearchParams()
    seriesIds.forEach((id) => params.append('series', id))

    const response = await axios.get(`${API_BASE}/fred/rates?${params.toString()}`)
    return response.data
  },

  updateMarketFromFRED: async (seriesIds) => {
    const response = await axios.post(`${API_BASE}/fred/update`, {
      seriesIds,
    })
    return response.data
  },
}
