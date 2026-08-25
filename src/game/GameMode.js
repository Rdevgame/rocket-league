/**
 * GameMode - Different game mode configurations
 */
class GameMode {
  static modes = {
    CASUAL_1V1: {
      name: '1v1',
      maxPlayers: 2,
      teamsPerSide: 1,
      matchLength: 300, // 5 minutes
      goalLimit: Infinity,
      description: 'One-on-one competitive match'
    },
    CASUAL_2V2: {
      name: '2v2',
      maxPlayers: 4,
      teamsPerSide: 2,
      matchLength: 300,
      goalLimit: Infinity,
      description: 'Two versus two competitive match'
    },
    CASUAL_3V3: {
      name: '3v3',
      maxPlayers: 6,
      teamsPerSide: 3,
      matchLength: 300,
      goalLimit: Infinity,
      description: 'Three versus three competitive match'
    },
    RANKED_1V1: {
      name: 'Ranked 1v1',
      maxPlayers: 2,
      teamsPerSide: 1,
      matchLength: 300,
      goalLimit: Infinity,
      description: 'Ranked one-on-one match',
      ranked: true
    },
    RANKED_2V2: {
      name: 'Ranked 2v2',
      maxPlayers: 4,
      teamsPerSide: 2,
      matchLength: 300,
      goalLimit: Infinity,
      description: 'Ranked two versus two match',
      ranked: true
    },
    TRAINING: {
      name: 'Training',
      maxPlayers: 1,
      teamsPerSide: 1,
      matchLength: Infinity,
      goalLimit: Infinity,
      description: 'Practice mode with optional bots'
    },
    CUSTOM: {
      name: 'Custom',
      maxPlayers: 6,
      teamsPerSide: 3,
      matchLength: 300,
      goalLimit: Infinity,
      description: 'Customizable game settings'
    }
  };

  static getMode(modeName) {
    return this.modes[modeName];
  }

  static getAllModes() {
    return this.modes;
  }
}

module.exports = GameMode;
