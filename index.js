"use strict";

const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const ayarlar = require("./ayarlar.json");
//var commands = require("./commands.js");

var tictacgame, symbols = [":regional_indicator_x:",":regional_indicator_o:"],  map = {}, nr;

class Command {
	
	constructor (message) {
	
		this._commandName = message.content.substring(1).split(' ')[0];
		this._argsNumber = message.content.substring(1).split(' ').length - 1;
		this._commandArgs = [];
		for(var i = 1; i <= this._argsNumber; i++ ){
			this._commandArgs[i-1] = message.content.substring(1).split(' ')[i];
		}
		this._commandChannel = message.channel.id;

	}

	doCommand (message) {

    	switch(this._commandName) {
        	
			case 'tictactoe':

				if( this._argsNumber != 1) {

					message.reply("Doğru Kullanım: -tictactoe <@kullanıcı_id>");
					return;
				}

				var player2 = this._commandArgs[0].slice(2);
				player2 = player2.slice(0,player2.length - 1);

				var membersArray = message.guild.members.array();
				var player2IsMember = false;

				for(var i in membersArray){
					if(message.guild.members.array()[i].user.id === player2)
						player2IsMember = true;
				}

				if(!player2IsMember){
					message.reply("Doğru Kullanım: -tictactoe <@kullanıcı_id>");
					return;
				}

				if(map[this._commandChannel]){

					message.reply("Zaten şuanda bir oyun oynanıyor");
					return;

				}
				
				map[this._commandChannel] = new TicTacToe(message);
				map[this._commandChannel].startGame(message);
				break;
			case 'işaretle':
				if(!map[message.channel.id]){
						message.reply("Bu kanalda bir tic-tac-toe oyunu oynanmıyor!");
						return;
					}
				if(message.content.substring(1).split(' ').length != 3 || 
						 ( message.content.substring(1).split(' ')[1] != 0 && 
						   message.content.substring(1).split(' ')[1] != 1 &&
						   message.content.substring(1).split(' ')[1] != 2 
					) || ( message.content.substring(1).split(' ')[2] != 0 && 
						   message.content.substring(1).split(' ')[2] != 1 &&
						   message.content.substring(1).split(' ')[2] != 2
					)
				) {
					message.reply("Lütfen doğru bir koordinat girin örnek: -işaretle 0 0 veya -işaretle 2 2 sıra ve satırlar 0 ile 2 araasındadır!");
				return;
				}
				else map[message.channel.id].playGame(message);
				break;
			break;
		}
	}
}

class Game {

	constructor (){
		this._gameChannel = 0;
		this._players = [];
	}

	startGame(message){}
	endGame(message){}
	playGame(message){}
}

class TicTacToe extends Game {
	
	constructor (message) {
		super();
		this._gameChannel = message.channel.id;
		this._players[0] = message.author.id;
		this._players[1] =  message.content.substring(1).split(' ')[1];
		this._turn = 0;
		this._gameBoard = [ [..."🔁🔁🔁"],
							[..."🔁🔁🔁"],
							[..."🔁🔁🔁"]
						  ];
	}

	startGame (message) {

		this._players[1] = this._players[1].slice(2,20);
	
		message.reply("<@" + this._players[1] + "> ile bir tic-tac-toe oyunu başlattın. -işaretle <satır> <sıra> komutu ile bir işaretleme yap!");
		 
		message.channel.send(this._gameBoard[0][0] + " " +
							 this._gameBoard[0][1] + " " +
							 this._gameBoard[0][2] + " \n" +
							 this._gameBoard[1][0] + " " +
							 this._gameBoard[1][1] + " " +
							 this._gameBoard[1][2] + " \n" +
							 this._gameBoard[2][0] + " " +
							 this._gameBoard[2][1] + " " +
							 this._gameBoard[2][2] + " ");
	}

	endGameWin (message) {

		for (var i in map){
			if(i==this._gameChannel && map[i] == "tictactoe")
				map[i] = "";
		}
		
		message.channel.send("<@" + this._players[this._turn] + "> Maalesef Kaybettin!");
		

		map[this._gameChannel] = "";

		return true;

	}

	endGameDraw (message) {
		
		message.channel.send("Berabere!");

		map[this._gameChannel] = "";

		return true;

	}

	isItADraw () {
		for(var x=0;x<3;x++)
			for(var y=0;y<3;y++)
				if(this._gameBoard[x][y] == '🔁')
					return false;

		return true;
	}

	isItAWin (i,j) {
		if ((this._gameBoard[0][j] != '🔁' && this._gameBoard[0][j] == this._gameBoard[1][j] && this._gameBoard[1][j] == this._gameBoard[2][j]) ||
			(this._gameBoard[i][0] != '🔁' && this._gameBoard[i][0] == this._gameBoard[i][1] && this._gameBoard[i][1] == this._gameBoard[i][2]) ||
			(this._gameBoard[0][0] != '🔁' && this._gameBoard[0][0] == this._gameBoard[1][1] && this._gameBoard[1][1] == this._gameBoard[2][2]) ||
			(this._gameBoard[0][2] != '🔁' && this._gameBoard[0][2] == this._gameBoard[1][1] && this._gameBoard[1][1] == this._gameBoard[2][0]))
			return true;
		return false;
	}

	playGame (message) {

		if(message.author.id != this._players[this._turn]){
			message.reply("Senin sıran daha gelmedi dostum diğer oyuncuy bekle!");
			return;
		}

		var i = message.content.substring(1).split(' ')[1];
		var j = message.content.substring(1).split(' ')[2];

		if(i <0 || i>2 || j<0 || j>2) {
			message.reply("Hatalı bir harekette bulundun, koordinatlar 0 ile 2 arasında! ");
			return;
		}

		if(this._gameBoard[i][j] != "🔁") {
			message.reply("Bu bölge zaten kullanılmış!");
			return;
		}

		this._gameBoard[i][j] = symbols[this._turn];

		message.channel.send(this._gameBoard[0][0] + " " +
							 this._gameBoard[0][1] + " " +
							 this._gameBoard[0][2] + " \n" +
							 this._gameBoard[1][0] + " " +
							 this._gameBoard[1][1] + " " +
							 this._gameBoard[1][2] + " \n" +
							 this._gameBoard[2][0] + " " +
							 this._gameBoard[2][1] + " " +
							 this._gameBoard[2][2] + " ");

		this._turn = this._turn == 1 ? 0 : 1;

		if(this.isItADraw()){
			this.endGameDraw(message);
			return;
		}

		if(this.isItAWin(i,j)){
			this.endGameWin(message);
			return;
		}

		message.channel.send("<@" + this._players[this._turn] + ">, Sıra sende.");
	}

}



function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

client.on('ready', function() {
	console.log('Hazırım!');
	//client.user.setUsername("woodietictactoebot");
	
});

client.on('message', async function(message) {
	
	if(message.author.bot) return;

	if (message.content.substring(0, 1) == '-') {           	
		var command = new Command(message);
		command.doCommand(message);
	}
});

client.login(process.env.BOT_TOKEN);
