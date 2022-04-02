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

    let getTotal = () => {
        return current + tax + savings + salary
    }

    let getPerc = (item) => {
        let total = getTotal()
        return `${((item / total) * 100).toFixed(2)}%`
    }

    let getPercentage = () => {
        let text = `
            <span>Current:${getPerc(current)} Tax:${getPerc(tax)} Savings:${getPerc(savings)} Salary:${getPerc(salary)}</span>
        `
        document.querySelector('.perc').innerHTML = text
    }

    let getTotalCurrent = () => {
        Array.prototype.slice.call(document.querySelectorAll('input.current')).map(item => {
            return current += item.value
        })
    }

    let getTotalSavings = () => {
        Array.prototype.slice.call(document.querySelectorAll('input.savings')).map(item => {
            return current += item.value
        })
    }
    let getTotalTax = () => {
        Array.prototype.slice.call(document.querySelectorAll('input.tax')).map(item => {
            return current += item.value
        })
    }

    let getTotalSalary = () => {
        Array.prototype.slice.call(document.querySelectorAll('input.salary')).map(item => {
            return current += item.value
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
            if (item.biz_wallet_type === 'tax') {
                console.log('hi')
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
        })
        hideLoader()
    }

    const resetWallet = async () => {
        showLoader()
        const trial = await fetcher(SET_WALLET_ALLOCATION_TO_DEFAULT, 'POST', {
            'biz_account_id': '577'
        })
        mainForm.innerHTML = ''
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