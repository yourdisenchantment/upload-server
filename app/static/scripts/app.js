// ============================================
// КОНСТАНТЫ
// ============================================
const UPLOAD_ENDPOINT = '/api/upload'
const HISTORY_ENDPOINT = '/api/history'

// ============================================
// DOM ЭЛЕМЕНТЫ
// ============================================
const fileInput = document.getElementById('fileInput')
const uploadBtn = document.getElementById('uploadBtn')
const progressContainer = document.getElementById('progressContainer')
const progressFill = document.getElementById('progressFill')
const progressText = document.getElementById('progressText')
const progressPercent = document.getElementById('progressPercent')
const fileInfo = document.getElementById('fileInfo')
const historyBlock = document.getElementById('history')
const historyList = document.getElementById('history-list')

// ============================================
// УТИЛИТЫ
// ============================================

/**
 * Получить значение cookie по имени
 */
function getCookie(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
    return null
}

/**
 * Форматирование размера файла
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i]
}

/**
 * Форматирование даты из dd-mm-yyyy в dd.mm.yyyy
 */
function formatDate(dateStr) {
    return dateStr.replace(/-/g, '.')
}

/**
 * Склонение слова "файл"
 */
function pluralizeFiles(count) {
    const lastDigit = count % 10
    const lastTwoDigits = count % 100

    if (lastDigit === 1 && lastTwoDigits !== 11) {
        return count + ' файл'
    } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
        return count + ' файла'
    } else {
        return count + ' файлов'
    }
}

/**
 * Вибрация (если поддерживается)
 */
function vibrate(duration = 50) {
    if ('vibrate' in navigator) {
        navigator.vibrate(duration)
    }
}

// ============================================
// ИСТОРИЯ
// ============================================

/**
 * Загрузка истории с сервера
 */
async function loadHistory(userId) {
    try {
        const response = await fetch(`${HISTORY_ENDPOINT}/${userId}`)
        if (!response.ok) throw new Error('Failed to load history')

        const history = await response.json()
        displayHistory(history)
    } catch (error) {
        console.error('Error loading history:', error)
    }
}

/**
 * Отображение истории на странице
 * Формат: dd.mm.yyyy: N файлов | X.X MB
 */
function displayHistory(records) {
    if (!records || records.length === 0) {
        historyBlock.style.display = 'none'
        return
    }

    historyBlock.style.display = 'block'
    historyList.innerHTML = ''

    records.forEach(record => {
        addHistoryItem(record)
    })
}

/**
 * Добавить одну запись в историю
 * Формат: {upload_number} | {date} | {file count} ({size})
 */
function addHistoryItem(record) {
    const item = document.createElement('div')
    item.className = 'history-item'

    const uploadNum = String(record.upload_number).padStart(5, '0')  // 00006
    const date = formatDate(record.date)  // 25.01.2025
    const files = pluralizeFiles(record.files_count)  // 5 файлов
    const size = formatFileSize(record.total_size)  // 2.3 MB

    // Формат: 00006 | 25.01.2025 | 5 файлов (2.3 MB)
    item.textContent = `${uploadNum} | ${date} | ${files} (${size})`

    historyList.appendChild(item)
}

/**
 * Дозаписать новую запись в начало истории
 */
function prependHistoryItem(record) {
    historyBlock.style.display = 'block'

    const item = document.createElement('div')
    item.className = 'history-item'

    const uploadNum = String(record.upload_number).padStart(5, '0')  // 00006
    const date = formatDate(record.date)  // 25.01.2025
    const files = pluralizeFiles(record.files_count)  // 5 файлов
    const size = formatFileSize(record.total_size)  // 2.3 MB

    // Формат: 00006 | 25.01.2025 | 5 файлов (2.3 MB)
    item.textContent = `${uploadNum} | ${date} | ${files} (${size})`

    // Вставить в начало (новые записи сверху)
    historyList.insertBefore(item, historyList.firstChild)
}

// ============================================
// ЗАГРУЗКА ФАЙЛОВ
// ============================================

/**
 * Обработка выбора файлов
 */
uploadBtn.addEventListener('click', () => {
    vibrate(50)
    fileInput.click()
})

fileInput.addEventListener('change', () => {
    const files = fileInput.files
    if (files.length > 0) {
        uploadFiles(files)
    }
})

/**
 * Загрузка файлов на сервер
 */
async function uploadFiles(files) {
    // Подготовка
    const formData = new FormData()
    let totalSize = 0

    for (let file of files) {
        formData.append('files', file)
        totalSize += file.size
    }

    // Показать прогресс-бар
    showProgress(files.length, totalSize)

    // Отключить кнопку
    uploadBtn.disabled = true

    // XMLHttpRequest для отслеживания прогресса
    const xhr = new XMLHttpRequest()

    // Прогресс загрузки
    xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100)
            updateProgress(percent)
        }
    }

    // Успешная загрузка
    xhr.onload = () => {
        if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText)
            onUploadSuccess(result)
        } else {
            onUploadError('Ошибка сервера')
        }
    }

    // Ошибка сети
    xhr.onerror = () => onUploadError('Ошибка сети')

    // Отправка
    xhr.open('POST', UPLOAD_ENDPOINT)
    xhr.send(formData)
}

/**
 * Показать прогресс-бар
 */
function showProgress(filesCount, totalSize) {
    progressContainer.style.display = 'block'
    progressFill.style.width = '0%'
    progressPercent.textContent = '0%'
    progressText.textContent = 'Загрузка...'
    fileInfo.textContent = `${pluralizeFiles(filesCount)} | ${formatFileSize(totalSize)}`
}

/**
 * Обновить прогресс
 */
function updateProgress(percent) {
    progressFill.style.width = percent + '%'
    progressPercent.textContent = percent + '%'
}

/**
 * Скрыть прогресс-бар
 */
function hideProgress() {
    setTimeout(() => {
        progressContainer.style.display = 'none'
        progressFill.style.width = '0%'
    }, 1000)
}

/**
 * Успешная загрузка
 */
function onUploadSuccess(result) {
    vibrate([50, 100, 50]) // Двойная вибрация

    // Показать 100%
    updateProgress(100)
    progressText.textContent = '✅ Загрузка завершена!'
    fileInfo.textContent = result.message

    // Toast уведомление с номером
    showToast(`#${result.upload_number}: Загружено ${pluralizeFiles(result.files_count)}`, 'success')

    // Дозаписать новую запись в историю
    const newRecord = {
        upload_number: result.upload_number,  // ← Это поле должно быть!
        date: new Date().toLocaleDateString('ru-RU').split('.').reverse().join('-'),
        user_id: result.user_id,
        files_count: result.files_count,
        total_size: result.total_size,
        folder_name: result.folder_name
    }

    prependHistoryItem(newRecord)

    // Скрыть прогресс и включить кнопку
    hideProgress()
    uploadBtn.disabled = false
    fileInput.value = '' // Очистить input
}


/**
 * Ошибка загрузки
 */
function onUploadError(message) {
    vibrate(200) // Длинная вибрация при ошибке

    progressText.textContent = '❌ ' + message
    progressText.style.color = '#e24666'
    fileInfo.textContent = 'Попробуйте снова'

    // Toast уведомление
    showToast(message, 'error')

    setTimeout(() => {
        progressText.style.color = '#333'
        hideProgress()
    }, 3000)

    uploadBtn.disabled = false
    fileInput.value = ''
}

// ============================================
// TOAST УВЕДОМЛЕНИЯ
// ============================================

const toastContainer = document.getElementById('toastContainer')

/**
 * Показать toast уведомление
 */
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div')
    toast.className = `toast ${type}`

    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
    toast.innerHTML = `${icon} ${message}`

    toastContainer.appendChild(toast)

    // Автоматическое удаление
    setTimeout(() => {
        toast.classList.add('removing')
        setTimeout(() => toast.remove(), 300)
    }, duration)
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

/**
 * Загрузка при открытии страницы
 */
window.addEventListener('DOMContentLoaded', () => {
    const userId = getCookie('user_id')

    if (userId) {
        console.log('Существующий пользователь:', userId)
        loadHistory(userId)
    } else {
        console.log('Новый пользователь')
    }
})
