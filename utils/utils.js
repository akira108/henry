import { parse, format, parseJSON } from 'date-fns'

export const parseDate = (str) => parse(str, 'yyyy-MM-dd', new Date())

export const parseJsonDate = (str) => parseJSON(str)

export const formatDate = (date) => {
    try {
        return format(date, 'yyyy-MM-dd')
    } catch (e) {
        return ""
    }
}

export const validateDate = (str) => {
    const date = parseDate(str)
    return !isNaN(date)
}