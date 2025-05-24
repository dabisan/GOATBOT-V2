const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
	config: {
		name: "ايمو",
		version: "1.3",
		author: "يونو",
		countDown: 5,
		role: 0,
		description: {
			vi: "chơi game đuổi hình bắt chữ",
			en: "العب لعبة التقاط الكلمة"
		},
		category: "العاب",
		guide: {
			en: "{pn}"
		},
		envConfig: {
			reward: 1000
		}
	},

	langs: {
		vi: {
			reply: "Hãy reply tin nhắn này với câu trả lời\n%1",
			isSong: "هذا هو اسم الأغنية للمغني %1",
			notPlayer: "⚠️ Bạn không phải là người chơi của câu hỏi này",
			correct: "🎉 Chúc mừng bạn đã trả lời đúng và nhận được %1$",
			wrong: "⚠️ Bạn đã trả lời sai"
		},
		en: {
			reply: "يرجى الرد على هذه الرسالة بالإجابة\n%1",
			isSong: " هذا هو اسم الاغنية %1",
			notPlayer: "⚠️ أنت لست اللاعب لهذا السؤال",
			correct: "🎉 مبروك لقد أجبت بشكل صحيح وحصلت على %1$",
			wrong: " لقد أجبت بشكل خاطئ🫥"
		}
	},

	onStart: async function ({ message, event, commandName, getLang }) {
		const datagame = (await axios.get("https://goatbotserver.onrender.com/api/duoihinhbatchu")).data;
		const { wordcomplete, casi, image1, image2 } = datagame.data;

		message.reply({
			body: getLang("reply", wordcomplete.replace(/\S/g, "█ ")) + (casi ? getLang("isSong", casi) : ''),
			attachment: [
				await getStreamFromURL(image1),
				await getStreamFromURL(image2)
			]
		}, (err, info) => {
			global.GoatBot.onReply.set(info.messageID, {
				commandName,
				messageID: info.messageID,
				author: event.senderID,
				wordcomplete
			});
		});
	},

	onReply: async ({ message, Reply, event, getLang, usersData, envCommands, commandName }) => {
		const { author, wordcomplete, messageID } = Reply;
		if (event.senderID != author)
			return message.reply(getLang("notPlayer"));

		if (formatText(event.body) == formatText(wordcomplete)) {
			global.GoatBot.onReply.delete(messageID);
			await usersData.addMoney(event.senderID, envCommands[commandName].reward);
			message.reply(getLang("correct", envCommands[commandName].reward));
		}
		else
			message.reply(getLang("wrong"));
	}
};

function formatText(text) {
	return text.normalize("NFD")
		.toLowerCase()
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[đ|Đ]/g, (x) => x == "đ" ? "d" : "D");
}
