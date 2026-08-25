/**
 * MatchmakingSystem - Find and pair players for matches
 */
class MatchmakingSystem {
  constructor() {
    this.queue = [];
    this.ratingRanges = [
      { min: 0, max: 900, tier: 'Bronze' },
      { min: 900, max: 1100, tier: 'Silver' },
      { min: 1100, max: 1300, tier: 'Gold' },
      { min: 1300, max: 1500, tier: 'Platinum' },
      { min: 1500, max: 1700, tier: 'Diamond' },
      { min: 1700, max: Infinity, tier: 'Champion' }
    ];
    this.searchRadius = 100; // Rating points
    this.maxWaitTime = 30; // seconds
  }

  /**
   * Add player to matchmaking queue
   */
  addToQueue(player, gameMode) {
    this.queue.push({
      player: player,
      gameMode: gameMode,
      joinTime: Date.now(),
      rating: player.rating || 1200
    });
    console.log(`👥 ${player.name} added to ${gameMode} queue`);
  }

  /**
   * Remove player from queue
   */
  removeFromQueue(playerId) {
    this.queue = this.queue.filter(entry => entry.player.id !== playerId);
  }

  /**
   * Find match for player
   */
  findMatch(player, gameMode, maxPlayers) {
    const candidates = this.queue.filter(
      entry => entry.gameMode === gameMode && entry.player.id !== player.id
    );

    // Sort by rating similarity
    candidates.sort((a, b) => {
      const diffA = Math.abs(a.rating - player.rating);
      const diffB = Math.abs(b.rating - player.rating);
      return diffA - diffB;
    });

    // Match players
    const match = [player];
    for (let candidate of candidates) {
      if (match.length >= maxPlayers) break;
      const ratingDiff = Math.abs(candidate.rating - player.rating);
      const waitTime = (Date.now() - candidate.joinTime) / 1000;

      // Increase search radius over time
      const currentRadius = this.searchRadius + (waitTime * 50);

      if (ratingDiff <= currentRadius) {
        match.push(candidate.player);
      }
    }

    return match.length === maxPlayers ? match : null;
  }

  /**
   * Get player tier
   */
  getTier(rating) {
    for (let range of this.ratingRanges) {
      if (rating >= range.min && rating < range.max) {
        return range.tier;
      }
    }
    return 'Champion';
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      totalPlayers: this.queue.length,
      averageWaitTime: this.queue.length > 0
        ? ((Date.now() - this.queue[0].joinTime) / 1000).toFixed(1)
        : 0
    };
  }
}

module.exports = MatchmakingSystem;
