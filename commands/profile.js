const Canvas = require("@napi-rs/canvas");
const { GlobalFonts } = require("@napi-rs/canvas");
const { AttachmentBuilder } = require(`discord.js`);
const { request } = require("undici");
const getUserInformation = require('../database/GetUserInformation');

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Display your profile")
    .addUserOption((user) =>
      user
        .setName("user")
        .setDescription("View the Profile of the mentioned user")
        .setRequired(false)
    ),

  async execute(interaction) {
    
    //console.log(interaction);
    //Get Canva
    const canvas = Canvas.createCanvas(700, 250);
    const context = canvas.getContext("2d");

    //Variables
    const user = interaction.options.get("user")?.value ?? interaction.user.id;

    try {
      //Get current User with data
      var newUser = await getUserInformation.getUserId(interaction.guild.id, user);
      var currentUserLevel = await getUserInformation.getUserLevel(newUser.id);
      var currentUserExp = await getUserInformation.getUserExperience(newUser.id);
      var { startAt, endAt } = await require('../database/GetLevel').getLevelRange(currentUserLevel);
    } catch (error) {
      console.error(error);
    }
    //If user not exist get Stats for Level 1
    if (endAt == null || startAt == null) {
      var endAt = require('../database/GetLevel').getLevelRange(1).endAt;
    }

    if(currentUserExp > startAt && currentUserLevel > 1){
      currentUserExp = currentUserExp - startAt;
    }
    
    if (currentUserExp == null) {
      currentUserExp = "0";
    }

    if (currentUserLevel == null) {
      currentUserLevel = 1;
    }

    //Canvas Variables
    const space = 10;
    const progessbarHeight = 40;
    const progessbarTopPosition = canvas.height - progessbarHeight - space * 2;
    const calculateProgess = (currentUserExp * 100) / endAt;
    const loadedProgress =
      ((canvas.width - space * 4) * calculateProgess) / 100 - 2;
    const min = 1;
    const max = 2;
    const whichTheme = Math.floor(Math.random() * (max - min + 1) + min);
    var imageLink;
    var progessBarBackround;
  
    switch (whichTheme) {
      case 1:
        imageLink = "./images/Medium_Widget.png";
        progessBarBackround = "240, 112, 172";
        progessBarForeground = "252, 223, 238";
        break;

      case 2:
        imageLink = "./images/Sonnenuntergang-mit-Mond.png";
        progessBarBackround = "207, 147, 254";
        progessBarForeground = "253, 169, 188";
        break;

      default:
        imageLink = "./images/Sonnenuntergang-mit-Mond.png";
        progessBarBackround = "207, 147, 254";
        progessBarForeground = "253, 169, 188";
        break;
    }

    //Font
    GlobalFonts.registerFromPath(
      "./fonts/MochaFrappuccino-Regular.ttf",
      "Mocha Regular"
    );
    GlobalFonts.registerFromPath(
      "./fonts/MochaFrappuccino-Bold.ttf",
      "Mocha Bold"
    );

    //Draw Background
    const background = await Canvas.loadImage(imageLink);
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    //Border
    context.strokeStyle = "#0099ff";
    context.strokeRect(0, 0, canvas.width, canvas.height);

    //Shadow Background
    context.fillStyle = "rgba(0, 0, 0, 0.1)";
    context.fillRect(
      space,
      space,
      canvas.width - space * 2,
      canvas.height - space * 2
    );

    //ProgressBar
    context.fillStyle = `rgba(${progessBarBackround}, 0.3)`;
    context.strokeStyle = `rgba(${progessBarBackround}, 0.7)`;
    context.filter = `drop-shadow(10px -10px 20px rgba(0,0,0, 0.5))`;
    context.strokeRect(
      space * 2,
      progessbarTopPosition,
      canvas.width - space * 4,
      progessbarHeight
    );
    context.fillRect(
      space * 2,
      progessbarTopPosition,
      canvas.width - space * 4,
      progessbarHeight
    );

    //ProgressBar - Amount
    context.filter = "drop-shadow(0 0 0 #fff)";
    context.fillStyle = `rgba(${progessBarForeground}, 0.7)`;
    context.fillRect(
      space * 2 + 1,
      progessbarTopPosition + 1,
      loadedProgress,
      progessbarHeight - 2
    );

    // Slightly smaller text placed above the member's display name
    context.font = "36px 'Mocha Bold'";
    context.fillStyle = "#ffffff";
    context.fillText("Profile", canvas.width / 3, canvas.width / 11);

    // Add an exclamation point here and below
    context.font = "42px 'Mocha Regular'";
    context.fillStyle = "#ffffff";
    context.fillText(
      `${newUser.displayName}`,
      canvas.width / 2.5,
      canvas.height / 2
    );

    // Expierence Points
    context.font = "24px 'Mocha Regular'";
    context.fillStyle = "#ffffff";
    context.fillText(
      `${currentUserExp} / ${endAt} Exp`,
      225,
      progessbarTopPosition - 5
    );

    //Level
    context.font = "36px 'Mocha Regular'";
    context.fillStyle = "#ffffff";
    context.fillText(`${currentUserLevel}`, canvas.width - 50, 50);

    //Clip Avatar to Round Path
    context.beginPath();
    context.arc(125, 125, 100, 0, Math.PI * 2, true);
    context.closePath();
    context.clip();

    //Get Avatar
    const { body } = await request(newUser.displayAvatarURL({ dynamic: true }));
    const avatar = await Canvas.loadImage(await body.arrayBuffer());
    context.drawImage(avatar, 25, 25, 200, 200);

    //Canvas to Image
    const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
      name: "profile-image.png",
    });

    //Respond
    try{
      interaction.reply({ files: [attachment] });
    } catch(error){
      console.error(error);
    }
  },
};

console.log("👱 Command initialisiert");
return;