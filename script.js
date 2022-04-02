const ROOT_URL = "https://stage.gnmfbdoc.com/api/v1"
const SUB_ACCOUNTS_LIST = `${ROOT_URL}/account/holder_sub_wallets/577`
const UPDATE_WALLET_ALLOCATION = `${ROOT_URL}/account/stake_share_add/`
const SET_WALLET_ALLOCATION_TO_DEFAULT = `${ROOT_URL}/account/readjust_wallet_share/`

let mainForm = document.querySelector('.main-form-container')
let loader = document.querySelector('.loader-wrapper')
let saveBtn = document.getElementById('save')
let resetBtn = document.getElementById('reset')

const showLoader = () => {
    loader.style.display = 'flex'
}

const hideLoader = () => {
    loader.style.display = 'none'
}

async function fetcher(url = '', type = 'GET', data = null) {
    const options = {
        method: type,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Token 93bb857fc50111f12df9daa1d9eb898e9ca009bdcd4aae18f9703c0aa0987678'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
    }
    if (data) {
        options.body = JSON.stringify(data)
    }
    const response = await fetch(url, options);
    return response.json();
}


document.addEventListener('DOMContentLoaded', () => {
    let current = 0;
    let tax = 0;
    let savings = 0;
    let salary = 0;
    let other = 0;

    let getTotal = () => {
        let total = Number(current) + Number(tax) + Number(savings) + Number(salary) + Number(other)
        return total
    }

    let getPerc = (item) => {
        let total = getTotal()
        if (!item || !total) {
            return '0%'
        }
        return `${(((Number(item) || 0) / total) * 100).toFixed(2)}%`
    }

    let getPercentage = () => {
        let text = `
            <span>Current:${getPerc(current)} Tax:${getPerc(tax)} Savings:${getPerc(savings)} Salary:${getPerc(salary)} Other:${getPerc(other)}</span>
        `
        document.querySelector('.perc').innerHTML = text
    }

    let getTotalCurrent = () => {
        current = 0
        Array.prototype.slice.call(document.querySelectorAll('input.current')).map(item => {
            return current += Number(item.value) || 0
        })
    }

    let getTotalSavings = () => {
        savings = 0
        Array.prototype.slice.call(document.querySelectorAll('input.savings')).map(item => {
            return savings += Number(item.value) || 0
        })
    }
    let getTotalTax = () => {
        tax = 0
        Array.prototype.slice.call(document.querySelectorAll('input.tax')).map(item => {
            return tax += Number(item.value) || 0
        })
        Array.prototype.slice.call(document.querySelectorAll('input.tap')).map(item => {
            return tax += Number(item.value) || 0
        })
    }

    let getTotalSalary = () => {
        salary = 0
        Array.prototype.slice.call(document.querySelectorAll('input.salary')).map(item => {
            return salary += Number(item.value) || 0
        })
    }
    let getTotalOther = () => {
        other = 0
        Array.prototype.slice.call(document.querySelectorAll('input.other')).map(item => {
            return other += Number(item.value) || 0
        })
    }

    let fetchSubAccounts = async () => {
        const { data } = await fetcher(SUB_ACCOUNTS_LIST)
        data.map((item, index) => {
            let el = document.createElement('div')
            let label = document.createElement('label')
            let input = document.createElement('input')
            let span = document.createElement('span')
            input.type = 'number'
            input.id = item.biz_wallet_id
            input.className = item.biz_wallet_type
            el.className = 'form-group'
            span.className = item.biz_wallet_id
            label.textContent = `Biz Wallet ${item.biz_wallet_id}`
            if (item.biz_wallet_type === 'current') {
                input.setAttribute('disabled', true)
            }
            input.value = item.incoming_allocation
            el.appendChild(label)
            el.appendChild(input)
            mainForm.appendChild(el)
            if (item.biz_wallet_type === 'tax' || item.biz_wallet_type === 'tap') {
                input.addEventListener('keyup', e => {
                    getTotalTax()
                    getPercentage()
                })
            }
            if (item.biz_wallet_type === 'savings') {
                input.addEventListener('keyup', e => {
                    getTotalSavings()
                    getPercentage()
                })
            }
            if (item.biz_wallet_type === 'current') {
                input.addEventListener('keyup', e => {
                    getTotalCurrent()
                    getPercentage()
                })
            }
            if (item.biz_wallet_type === 'salary') {
                input.addEventListener('keyup', e => {
                    getTotalSalary()
                    getPercentage()
                })
            }
            if (item.biz_wallet_type === 'other') {
                input.addEventListener('keyup', e => {
                    getTotalOther()
                    getPercentage()
                })
            }
        })
        hideLoader()
    }

    const resetWallet = async () => {
        showLoader()
        const trial = await fetcher(SET_WALLET_ALLOCATION_TO_DEFAULT, 'POST', {
            'biz_account_id': '577'
        })
        mainForm.innerHTML = ''
        current = 0;
        tax = 0;
        savings = 0;
        salary = 0;
        other = 0;
        getPercentage()
        await fetchSubAccounts()
    }

    const changeAllocationValues = async () => {
        let data = []
        let inputs = mainForm.querySelectorAll('input[type="number"]')
        inputs = Array.prototype.slice.call(inputs)
        inputs.map(item => {
            data.push({
                walletID: Number(item.value)
            })
        })
        const trial = await fetcher(UPDATE_WALLET_ALLOCATION, 'POST', {
            biz_account_id: '577',
            wallet_allocation: data
        })
    }

    resetBtn.addEventListener('click', resetWallet)
    saveBtn.addEventListener('click', changeAllocationValues)

    fetchSubAccounts()
})

// setTimeout(() => {
//     hideLoader()
// }, 5000)