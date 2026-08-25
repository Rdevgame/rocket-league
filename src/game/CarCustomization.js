/**
 * CarCustomization - Player car skins and customization
 */
class CarCustomization {
  static cars = {
    OCTANE: {
      name: 'Octane',
      type: 'balanced',
      hitbox: { width: 2, height: 1.3, length: 4.5 },
      description: 'Balanced all-around car'
    },
    DOMINUS: {
      name: 'Dominus',
      type: 'wide',
      hitbox: { width: 2.2, height: 1.2, length: 4.2 },
      description: 'Wide and aggressive'
    },
    BATMOBILE: {
      name: 'Batmobile',
      type: 'long',
      hitbox: { width: 1.9, height: 1.1, length: 5.1 },
      description: 'Extended reach and speed'
    },
    BREAKOUT: {
      name: 'Breakout',
      type: 'speed',
      hitbox: { width: 1.8, height: 1.1, length: 4.1 },
      description: 'Fast and nimble'
    }
  };

  static colors = [
    { name: 'Red', hex: '#ff0000' },
    { name: 'Blue', hex: '#0000ff' },
    { name: 'Green', hex: '#00ff00' },
    { name: 'Yellow', hex: '#ffff00' },
    { name: 'Purple', hex: '#ff00ff' },
    { name: 'Cyan', hex: '#00ffff' },
    { name: 'Orange', hex: '#ff6600' },
    { name: 'Pink', hex: '#ff69b4' }
  ];

  static decals = [
    { name: 'Dragon', rarity: 'rare' },
    { name: 'Flames', rarity: 'uncommon' },
    { name: 'Stripes', rarity: 'common' },
    { name: 'Carbon', rarity: 'rare' },
    { name: 'Lightning', rarity: 'epic' }
  ];

  static wheels = [
    { name: 'Standard', rarity: 'common' },
    { name: 'Exotic', rarity: 'rare' },
    { name: 'Black Market', rarity: 'epic' },
    { name: 'Limited', rarity: 'limited' }
  ];

  static getCar(carType) {
    return this.cars[carType] || this.cars.OCTANE;
  }

  static getAllCars() {
    return this.cars;
  }

  static getAllColors() {
    return this.colors;
  }
}

module.exports = CarCustomization;
