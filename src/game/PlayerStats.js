/**
 * PlayerStats - Track player statistics
 */
class PlayerStats {
  constructor(playerId) {
    this.playerId = playerId;
    this.goals = 0;
    this.assists = 0;
    this.saves = 0;
    this.shots = 0;
    this.shotAccuracy = 0;
    this.boostUsage = 0;
    this.aerialHits = 0;
    this.matchesPlayed = 0;
    this.matchesWon = 0;
    this.matchesLost = 0;
    this.rating = 1200; // ELO-like rating
    this.tier = 'Bronze'; // Bronze -> Silver -> Gold -> Platinum -> Diamond -> Champion
    this.timePlayedSeconds = 0;
    this.mostUsedCar = null;
    this.favoriteArena = null;
  }

  /**
   * Record goal
   */
  recordGoal() {
    this.goals++;
    this.shots++;
    this.shotAccuracy = (this.goals / this.shots) * 100;
  }

  /**
   * Record assist
   */
  recordAssist() {
    this.assists++;
  }

  /**
   * Record save
   */
  recordSave() {
    this.saves++;
  }

  /**
   * Record shot
   */
  recordShot() {
    this.shots++;
  }

  /**
   * Update rating based on match result
   */
  updateRating(won, matchRating = 20) {
    if (won) {
      this.rating += matchRating;
      this.matchesWon++;
    } else {
      this.rating -= matchRating / 2;
      this.matchesLost++;
    }
    this.matchesPlayed++;
    this.updateTier();
  }

  /**
   * Update tier based on rating
   */
  updateTier() {
    if (this.rating < 900) this.tier = 'Bronze';
    else if (this.rating < 1100) this.tier = 'Silver';
    else if (this.rating < 1300) this.tier = 'Gold';
    else if (this.rating < 1500) this.tier = 'Platinum';
    else if (this.rating < 1700) this.tier = 'Diamond';
    else this.tier = 'Champion';
  }

  /**
   * Get player stats summary
   */
  getSummary() {
    const winrate = this.matchesPlayed > 0 
      ? ((this.matchesWon / this.matchesPlayed) * 100).toFixed(1) 
      : '0';

    return {
      playerId: this.playerId,
      goals: this.goals,
      assists: this.assists,
      saves: this.saves,
      shots: this.shots,
      shotAccuracy: this.shotAccuracy.toFixed(1) + '%',
      matchesPlayed: this.matchesPlayed,
      winrate: winrate + '%',
      rating: this.rating,
      tier: this.tier,
      timePlayedHours: (this.timePlayedSeconds / 3600).toFixed(1),
      ratio: ((this.goals + this.assists + this.saves) / Math.max(1, this.matchesPlayed)).toFixed(2)
    };
  }
}

module.exports = PlayerStats;
