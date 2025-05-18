const mongoose = require("mongoose");
const moment = require('moment-timezone'); // Ensure Moment.js is imported
moment.tz.setDefault("Asia/Dhaka");

const fruitIcons = ["🍒", "🍊", "🍋", "🍇", "🍓", "🍍"];
const Globals = mongoose.model("globals");

module.exports = {
  config: {
    name: "bank",
    version: "1.6.9",
    author: "Nazrul",
    countDown: 5,
    role: 0,
    description: "Banking Bot System for managing your balance, deposits, withdrawals, transfers, interest, betting, loans",
    category: "bank",
    guide: {
      en: "💳 Banking Bot System for managing your balance, deposits, withdrawals, transfers, interest, betting, loans, and more.\n\n" +
        "💸 Balance: `{pn} balance` or `{pn} bal`\n" +
        "💵 Deposit: `{pn} deposit 100` or `{pn} dep 100`\n" +
        "💸 Withdraw: `{pn} withdraw 50` or `{pn} wd 50`\n" +
        "🎗️ Transfer: `{pn} transfer 200 [userID]` or `{pn} send 200 [userID]`\n" +
        "🔖 Interest: `{pn} interest` or `{pn} int`\n" +
        "🎰 Bet: `{pn} bet 100` or `{pn} gamble 100`\n" +
        "🏆 Richest: `{pn} richest` or `{pn} top`\n" +
        "💼 Services: `{pn} services` or `{pn} list`\n" +
        "📋 All Users: `{pn} list` or `{pn} users`\n" +
        "💳 Loan: `{pn} loan 5000` to borrow, `{pn} repay` to repay your loan\n\n" +
        "⚡ Note: Each action updates your bank data, including transaction history and balance."
    }
  },

  onStart: async function ({ args, message, event, usersData, api }) {
    const BankName = "🏦 ʸᵒᵘʳ Cʜᴏᴄᴏʟᴀᴛᴇ ᴮᴬᴺᴷ 🏦";
    const userID = event.senderID;
    const userMoney = await usersData.get(userID, "money");

    let bankStats = await Globals.findOne({ key: "BankData" });
    if (!bankStats) {
      bankStats = await Globals.create({ key: "BankData", data: { users: {} } });
    }

    if (!bankStats.data.users[userID]) {
      const userInfo = await usersData.get(userID);
      const name = userInfo.name || "User";
      bankStats.data.users[userID] = createUserData(name);
      await updateBankData(bankStats);
    }

    // Auto-repay loans if overdue
    await autoRepayLoan({ userID, usersData, bankStats, BankName, message });

    const userName = bankStats.data.users[userID].name;
    const command = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);
    let recipientUID = args[2];

    switch (command) {
      case "help":
      case "h":
        return sendHelpMessage(message, BankName);

      case "services":
      case "service":
      case "se":
        return sendServiceList(message, BankName);

      case "balance":
      case "bal":
        return handleBalance({ event, message, bankStats, userID, BankName });

      case "deposit":
      case "dep":
        return handleDeposit({ amount, userMoney, message, bankStats, userID, userName, usersData, BankName });

      case "withdraw":
      case "wd":
        return handleWithdraw({ amount, message, bankStats, userID, userName, usersData, userMoney, BankName });

      case "transfer":
      case "send":
        return handleTransfer({ amount, recipientUID, userID, bankStats, message, userName, api, BankName, event });

      case "interest":
      case "int":
        return handleInterest({ message, bankStats, userID, userName, BankName });

      case "richest":
      case "top":
        return showRichestUsers({ message, bankStats, BankName });

      case "bet":
      case "gamble":
      case "slot":
        return handleBet({ amount, userMoney, message, bankStats, userID, usersData, BankName });

      case "users":
      case "all":
      case "list":
        return listUsers({ message, bankStats, BankName });

      case "loan":
        return handleLoan({ amount, message, bankStats, userID, userName, usersData, BankName });

      case "repay":
        return handleRepayLoan({ message, bankStats, userID, userName, usersData, BankName });

      default:
        return message.reply(`${BankName}\n\n🎀 Invalid command. Type "bank help" for a list of commands.`);
    }
  }
};

// Helper Functions
async function updateBankData(bankStats) {
  await Globals.updateOne({ key: "BankData" }, { data: bankStats.data }, { upsert: true });
}

function createUserData(name) {
  return {
    name,
    bank: 0,
    loan: 0,
    loanDate: null,
    lastInterestClaimed: Date.now(),
    lastTransactionDate: null,
    totalDeposited: 0,
    totalWithdrawn: 0,
    transactionHistory: []
  };
}

function sendHelpMessage(message, BankName) {
  return message.reply(`${BankName}\n\n📜 Available Commands:\n\n1. 💸 balance\n2. 💵 deposit [amount]\n3. 💸 withdraw [amount]\n4. 🫂 transfer [amount] [userID]\n5. 🔖 interest\n6. 🏆 richest\n7. 🎰 bet [amount]\n8. 💳 loan [amount]\n9. 💳 repay\n10. 🏦 services\n11. 📜 users`);
}

function sendServiceList(message, BankName) {
  return message.reply(`${BankName}\n\n📜 Available Banking Services:\n\n1. 💼 Savings Account\n2. 💸 Money Transfers\n3. 🎰 Betting\n4. 🔖 Interest Claims\n5. 💳 Loans\n6. 💰 Balance Management\n\n🔒 Your data is securely managed.`);
}

function listUsers({ message, bankStats, BankName }) {
  const users = Object.entries(bankStats.data.users);
  
  if (users.length === 0) {
    return message.reply(`${BankName}\n\n🎀 No users found in the bank system.`);
  }

  const userList = users
    .map(([id, user], index) => `${index + 1}. ${user.name}: ${formatMoney(user.bank)}`)
    .join("\n");

  return message.reply(`${BankName}\n\n👑 Bank Users 👑:\n\n${userList}`);
}

// Loan Functions
async function handleLoan({ amount, message, bankStats, userID, userName, usersData, BankName }) {
  const LOAN_LIMIT = 20000;
  const user = bankStats.data.users[userID];
  const userBalance = await usersData.get(userID, "money");

  if (user.loan > 0) {
    const dueTime = moment(user.loanDate).add(3, 'days').format('MMMM Do YYYY, h:mm:ss A');
    return message.reply(`${BankName}\n\n🎀 ${userName}, you already have an outstanding loan of ${formatMoney(user.loan)}. Please repay it before ${dueTime}.`);
  }

  if (isNaN(amount) || amount <= 0 || amount > LOAN_LIMIT) {
    return message.reply(`${BankName}\n\n🎀 ${userName}, you can only take a loan up to ${formatMoney(LOAN_LIMIT)}.`);
  }

  user.loan = amount;
  user.loanDate = Date.now();
  await usersData.set(userID, { money: userBalance + amount });
  updateTransaction(user, "loan_taken", amount);

  await updateBankData(bankStats);
  return message.reply(`${BankName}\n\n🎀 ${userName}, you have successfully taken a loan of ${formatMoney(amount)}. Please repay it within 3 days.`);
}

async function handleRepayLoan({ message, bankStats, userID, userName, usersData, BankName }) {
  const user = bankStats.data.users[userID];
  const userMoney = await usersData.get(userID, "money");

  if (user.loan === 0) {
    return message.reply(`${BankName}\n\n🎀 ${userName}, you don't have any outstanding loans.`);
  }

  if (userMoney < user.loan) {
    return message.reply(`${BankName}\n\n🎀 ${userName}, you don't have enough money to repay the loan of ${formatMoney(user.loan)}.`);
  }

  await usersData.set(userID, { money: userMoney - user.loan });
  updateTransaction(user, "loan_repaid", user.loan);

  user.loan = 0;
  user.loanDate = null;
  await updateBankData(bankStats);

  return message.reply(`${BankName}\n\n🎀 ${userName}, you have successfully repaid your loan.`);
}

async function autoRepayLoan({ userID, usersData, bankStats, BankName, message }) {
  const user = bankStats.data.users[userID];
  const userMoney = await usersData.get(userID, "money");

  if (user.loan > 0) {
    const dueDate = moment(user.loanDate).add(3, 'days');
    if (moment().isAfter(dueDate)) {
      if (userMoney >= user.loan) {
        await usersData.set(userID, { money: userMoney - user.loan });
        updateTransaction(user, "loan_auto_repaid", user.loan);
        user.loan = 0;
        user.loanDate = null;
        await updateBankData(bankStats);
        message.reply(`${BankName}\n\n🎀 Your outstanding loan was automatically repaid from your balance.`);
      } else {
        message.reply(`${BankName}\n\n🎀 Your loan is overdue, but you don't have enough money for repayment. Please deposit funds.`);
      }
    }
  }
}

function handleBalance({ event, message, bankStats, userID, BankName }) {
  const targetID = event.messageReply?.senderID || Object.keys(event.mentions)[0] || userID;
  const targetData = bankStats.data.users[targetID];

  if (!targetData) {
    return message.reply(`${BankName}\n\n🎀 No bank data found for the user.`);
  }

  return message.reply(`${BankName}\n\n🎀 ${targetData.name}'s bank balance is ${formatMoney(targetData.bank)}.`);
}

async function handleDeposit({ amount, userMoney, message, bankStats, userID, userName, usersData, BankName }) {
  if (userMoney === 0) {
    return message.reply(`${BankName}\n\n🎀 ${userName}, your wallet is empty. Earn or receive money before depositing.`);
  }

  if (isNaN(amount) || amount <= 0 || userMoney < amount) {
    return message.reply(`${BankName}\n\n🎀 ${userName}, you don't have enough money to deposit this amount.`);
  }

  bankStats.data.users[userID].bank += amount;
  bankStats.data.users[userID].totalDeposited += amount;
  updateTransaction(bankStats.data.users[userID], "deposit", amount);
  
  await usersData.set(userID, { money: userMoney - amount });
  await updateBankData(bankStats);

  return message.reply(`${BankName}\n\n🎀 ${userName}, you successfully deposited ${formatMoney(amount)} into your bank account.`);
}

async function handleWithdraw({ amount, message, bankStats, userID, userName, usersData, userMoney, BankName }) {
  const balance = bankStats.data.users[userID].bank;

  if (balance === 0) {
    return message.reply(`${BankName}\n\n🎀 ${userName}, your bank balance is zero. Deposit money first.`);
  }

  if (isNaN(amount) || amount <= 0 || amount > balance) {
    return message.reply(`${BankName}\n\n🎀 ${userName}, insufficient bank balance to withdraw ${formatMoney(amount)}.`);
  }

  bankStats.data.users[userID].bank -= amount;
  bankStats.data.users[userID].totalWithdrawn += amount;
  updateTransaction(bankStats.data.users[userID], "withdraw", amount);

  await usersData.set(userID, { money: userMoney + amount });
  await updateBankData(bankStats);

  return message.reply(`${BankName}\n\n🎀 ${userName}, you withdrew ${formatMoney(amount)} successfully from your bank account.`);
}

async function handleTransfer({ amount, recipientUID, userID, bankStats, message, userName, api, BankName, event }) {
  recipientUID = getRecipientUID(event, recipientUID);

  if (!recipientUID) {
    return message.reply(`${BankName}\n\n🎀 ${userName}, please mention a user, reply to a user's message, or provide a valid user ID to transfer money.`);
  }

  if (isNaN(amount) || amount <= 0 || bankStats.data.users[userID].bank < amount) {
    return message.reply(`${BankName}\n\n🎀 ${userName}, invalid transfer details or insufficient funds.`);
  }

  if (userID === recipientUID) {
    return message.reply(`${BankName}\n\n🎀 ${userName}, you cannot transfer money to yourself.`);
  }

  if (!bankStats.data.users[recipientUID]) {
    const recipientInfo = await api.getUserInfo(recipientUID);
    const recipientName = recipientInfo[recipientUID]?.firstName || "Darling";
    bankStats.data.users[recipientUID] = createUserData(recipientName);
  }

  bankStats.data.users[userID].bank -= amount;
  updateTransaction(bankStats.data.users[userID], "transfer", amount, recipientUID);

  bankStats.data.users[recipientUID].bank += amount;
  updateTransaction(bankStats.data.users[recipientUID], "received", amount, userID);

  await updateBankData(bankStats);

  const recipientName = bankStats.data.users[recipientUID].name;
  return message.reply(`${BankName}\n\n🎀 ${userName}, you transferred ${formatMoney(amount)} to ${recipientName}.`);
}

// Helper function to determine recipient UID
function getRecipientUID(event, recipientUID) {
  if (event.messageReply) return event.messageReply.senderID;
  if (Object.keys(event.mentions).length > 0) return Object.keys(event.mentions)[0];
  if (!isNaN(recipientUID)) return recipientUID;
  return null;
}

function handleInterest({ message, bankStats, userID, userName, BankName }) {
  const interestRate = 0.0001;
  const lastClaimed = bankStats.data.users[userID].lastInterestClaimed;
  const timeElapsed = (Date.now() - lastClaimed) / (1000 * 60 * 60 * 24);
  const interestEarned = bankStats.data.users[userID].bank * interestRate * timeElapsed;

  bankStats.data.users[userID].bank += interestEarned;
  bankStats.data.users[userID].lastInterestClaimed = Date.now();
  updateTransaction(bankStats.data.users[userID], "interest", interestEarned);

  updateBankData(bankStats);
  return message.reply(`${BankName}\n\n🎀 ${userName}, you earned ${formatMoney(interestEarned)} in interest.`);
}

function showRichestUsers({ message, bankStats, BankName }) {
  const richestUsers = Object.entries(bankStats.data.users)
    .sort(([, a], [, b]) => b.bank - a.bank)
    .slice(0, 10)
    .map(([id, user], index) => `${index + 1}. ${user.name}: ${formatMoney(user.bank)}`)
    .join("\n");

  return message.reply(`${BankName}\n\n👑 Top 10 Richest Users 👑:\n\n${richestUsers}`);
}

async function handleBet({ amount, userMoney, message, bankStats, userID, usersData, BankName }) {
  if (isNaN(amount) || amount <= 0 || userMoney < amount) {
    return message.reply(`${BankName}\n\n🎀 Invalid bet amount.`);
  }

  const slots = Array.from({ length: 3 }, () => fruitIcons[Math.floor(Math.random() * fruitIcons.length)]);
  const multiplier = slots.every(s => s === slots[0]) ? 3 : slots[0] === slots[1] || slots[1] === slots[2] || slots[0] === slots[2] ? 2 : 0;
  const winnings = amount * multiplier;

  await usersData.set(userID, { money: userMoney - amount + winnings });
  updateTransaction(bankStats.data.users[userID], multiplier ? "bet_win" : "bet_loss", winnings || -amount);
  
  await updateBankData(bankStats);
  
  return message.reply(`${BankName}\n\n ${slots.join(" ")}\n\n🎀 ${multiplier ? `You won ${formatMoney(winnings)}!` : `You lost ${formatMoney(amount)}.`}`);
}

function updateTransaction(userData, type, amount, counterpartID = null) {
  userData.lastTransactionDate = new Date().toISOString();
  const transaction = { type, amount, date: new Date().toISOString() };
  if (counterpartID) transaction.counterpartID = counterpartID;
  userData.transactionHistory.push(transaction);
}

function formatMoney(amount) {
  if (amount >= 1e33) return (amount / 1e33).toFixed(2).replace(/\.00$/, '') + 'Dc';
  if (amount >= 1e30) return (amount / 1e30).toFixed(2).replace(/\.00$/, '') + 'No';
  if (amount >= 1e27) return (amount / 1e27).toFixed(2).replace(/\.00$/, '') + 'Oc';
  if (amount >= 1e24) return (amount / 1e24).toFixed(2).replace(/\.00$/, '') + 'Sp';
  if (amount >= 1e21) return (amount / 1e21).toFixed(2).replace(/\.00$/, '') + 'Sx';
  if (amount >= 1e18) return (amount / 1e18).toFixed(2).replace(/\.00$/, '') + 'Qi';
  if (amount >= 1e15) return (amount / 1e15).toFixed(2).replace(/\.00$/, '') + 'Qa';
  if (amount >= 1e12) return (amount / 1e12).toFixed(2).replace(/\.00$/, '') + 'T';
  if (amount >= 1e9) return (amount / 1e9).toFixed(2).replace(/\.00$/, '') + 'B';
  if (amount >= 1e6) return (amount / 1e6).toFixed(2).replace(/\.00$/, '') + 'M';
  if (amount >= 1e3) return (amount / 1e3).toFixed(2).replace(/\.00$/, '') + 'K';
  return amount.toString() + '💵';
  }
