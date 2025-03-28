const {
  MessageEmbed,
  Modal,
  TextInputComponent,
  MessageActionRow,
} = require('discord.js');
const structureConfig = require('../../Structures/Config');
const guildId = structureConfig.guildOnly.guildID;
const Profile = require('../../Models/Profile');
const Goods = require('../../Models/Goods');

module.exports = {
  name: 'buy',
  description: `buy goods by your SBT token!`,
  options: [
    {
      name: 'number',
      description: 'insert goods number',
      required: true,
      type: 'NUMBER',
    },
  ],
  type: 'COMMAND',
  async run({ interaction, bot }) {
    const goodsNumber = interaction.options.getNumber('number');
    const goods = await Goods.find({ GoodsID: goodsNumber });
    const guild = await bot.guilds.cache.get(guildId);
    const userId = interaction.user.id;
    const profile = await Profile.find({ UserID: userId, GuildID: guild.id });

    if (profile.length === 0) {
      await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('RED')
            .setDescription(`You don't have profile. Make a profile first.`),
        ],
      });
    } else if (!goods.length) {
      await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('RED')
            .setDescription(
              'You entered the wrong goods number. Please enter it again'
            ),
        ],
      });
    } else if (goods[0].Count === 0) {
      await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('RED')
            .setDescription('This goods is soldout. Please buy another goods.'),
        ],
      });
    } else if (profile[0].Wallet < goods[0].Price) {
      await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('RED')
            .setDescription(
              `You can't buy this goods because you don't have enough money`
            ),
        ],
      });
    } else {
      const nameInput = new TextInputComponent()
        .setCustomId(`NameInput`)
        .setLabel(`What's your name?`)
        .setStyle(1)
        .setMaxLength(20)
        .setRequired(true);

      const addressInput = new TextInputComponent()
        .setCustomId(`addressInput`)
        .setLabel(`What's your address?`)
        .setStyle(1)
        .setMaxLength(100)
        .setRequired(true);
      const phoneNumberInput = new TextInputComponent()
        .setCustomId('phoneNumberInput')
        .setLabel(`What's your phone number?`)
        .setStyle(1)
        .setMaxLength(20)
        .setRequired(true);
      const nameActionRow = new MessageActionRow().addComponents(nameInput);
      const addressActionRow = new MessageActionRow().addComponents(
        addressInput
      );
      const phoneNumberActionRow = new MessageActionRow().addComponents(
        phoneNumberInput
      );
      const components = [
        nameActionRow,
        addressActionRow,
        phoneNumberActionRow,
      ];
      if (goods[0].Size.length > 0) {
        const sizeOptions = goods[0].Size.join(', ');
        const sizeInput = new TextInputComponent()
          .setCustomId('SizeInput')
          .setLabel(`What's your size? (${sizeOptions})`)
          .setStyle(1)
          .setMaxLength(10)
          .setRequired(true);
        const sizeActionRow = new MessageActionRow().addComponents(sizeInput);
        components.push(sizeActionRow);
      }
      const modal = new Modal()
        .setCustomId(
          `orderInformationNumber${goodsNumber}Price${goods[0].Price}`
        )
        .setTitle('Order Information')
        .addComponents(components);

      await interaction.showModal(modal);
    }
  },
};
