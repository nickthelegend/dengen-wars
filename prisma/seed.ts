import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Seed Moves
  console.log('📝 Creating moves...')
  const moves = await prisma.move.createMany({
    data: [
      // Fire Moves
      { name: 'Flame Burst', elementType: 'FIRE', damage: 45, cooldown: 2, description: 'A basic fire attack that burns enemies', minLevel: 5, tier: 'BASIC' },
      { name: 'Inferno Strike', elementType: 'FIRE', damage: 65, cooldown: 3, description: 'A powerful fire attack with high damage', minLevel: 10, tier: 'ADVANCED' },
      { name: 'Meteor Crash', elementType: 'FIRE', damage: 85, cooldown: 4, description: 'Ultimate fire move with devastating power', minLevel: 15, tier: 'LEGENDARY' },
      { name: 'Fire Whip', elementType: 'FIRE', damage: 50, cooldown: 2, description: 'Lashing flames that strike multiple times', minLevel: 5, tier: 'BASIC' },
      { name: 'Phoenix Wing', elementType: 'FIRE', damage: 70, cooldown: 3, description: 'Blazing wings that soar through enemies', minLevel: 10, tier: 'ADVANCED' },
      { name: 'Solar Flare', elementType: 'FIRE', damage: 90, cooldown: 4, description: 'Blinding solar energy explosion', minLevel: 15, tier: 'LEGENDARY' },

      // Water Moves
      { name: 'Water Pulse', elementType: 'WATER', damage: 40, cooldown: 2, description: 'A basic water attack that soaks enemies', minLevel: 5, tier: 'BASIC' },
      { name: 'Tidal Wave', elementType: 'WATER', damage: 60, cooldown: 3, description: 'A powerful water attack that crashes down', minLevel: 10, tier: 'ADVANCED' },
      { name: 'Tsunami Force', elementType: 'WATER', damage: 80, cooldown: 4, description: 'Ultimate water move with crushing force', minLevel: 15, tier: 'LEGENDARY' },
      { name: 'Ice Shard', elementType: 'WATER', damage: 45, cooldown: 2, description: 'Sharp ice projectiles pierce enemies', minLevel: 5, tier: 'BASIC' },
      { name: 'Whirlpool', elementType: 'WATER', damage: 65, cooldown: 3, description: 'Spinning water vortex traps foes', minLevel: 10, tier: 'ADVANCED' },
      { name: 'Absolute Zero', elementType: 'WATER', damage: 85, cooldown: 4, description: 'Freezing attack that stops time', minLevel: 15, tier: 'LEGENDARY' },

      // Earth Moves
      { name: 'Rock Throw', elementType: 'EARTH', damage: 50, cooldown: 2, description: 'A basic earth attack using solid rocks', minLevel: 5, tier: 'BASIC' },
      { name: 'Earthquake', elementType: 'EARTH', damage: 70, cooldown: 3, description: 'A powerful earth attack that shakes the ground', minLevel: 10, tier: 'ADVANCED' },
      { name: 'Mountain Crush', elementType: 'EARTH', damage: 90, cooldown: 4, description: 'Ultimate earth move with immense weight', minLevel: 15, tier: 'LEGENDARY' },
      { name: 'Stone Spear', elementType: 'EARTH', damage: 55, cooldown: 2, description: 'Sharp stone projectile pierces armor', minLevel: 5, tier: 'BASIC' },
      { name: 'Landslide', elementType: 'EARTH', damage: 75, cooldown: 3, description: 'Cascading rocks bury opponents', minLevel: 10, tier: 'ADVANCED' },
      { name: 'Continental Drift', elementType: 'EARTH', damage: 95, cooldown: 4, description: 'Tectonic force reshapes battlefield', minLevel: 15, tier: 'LEGENDARY' },

      // Electric Moves
      { name: 'Thunder Bolt', elementType: 'ELECTRIC', damage: 55, cooldown: 2, description: 'A basic electric attack with shocking power', minLevel: 5, tier: 'BASIC' },
      { name: 'Lightning Strike', elementType: 'ELECTRIC', damage: 75, cooldown: 3, description: 'A powerful electric attack from the sky', minLevel: 10, tier: 'ADVANCED' },
      { name: 'Storm Fury', elementType: 'ELECTRIC', damage: 95, cooldown: 4, description: 'Ultimate electric move with storm power', minLevel: 15, tier: 'LEGENDARY' },
      { name: 'Static Shock', elementType: 'ELECTRIC', damage: 40, cooldown: 1, description: 'Quick electric jolt with low cooldown', minLevel: 5, tier: 'BASIC' },
      { name: 'Chain Lightning', elementType: 'ELECTRIC', damage: 60, cooldown: 3, description: 'Electric attack that jumps between foes', minLevel: 10, tier: 'ADVANCED' },
      { name: 'Divine Thunder', elementType: 'ELECTRIC', damage: 100, cooldown: 5, description: 'Godlike thunder from the heavens', minLevel: 20, tier: 'LEGENDARY' },
    ],
    skipDuplicates: true,
  })

  // Seed Abilities
  console.log('⚡ Creating abilities...')
  const abilities = await prisma.ability.createMany({
    data: [
      { name: 'Thick Skin', description: 'Reduces incoming damage by 10%', effectType: 'PASSIVE', effectData: { damageReduction: 0.1 }, rarity: 'COMMON' },
      { name: 'Berserker', description: 'Increases damage when health is below 50%', effectType: 'TRIGGER', effectData: { damageBoost: 1.3, healthThreshold: 0.5 }, rarity: 'RARE' },
      { name: 'Regeneration', description: 'Heals 5% health each turn', effectType: 'PASSIVE', effectData: { healPercent: 0.05 }, rarity: 'RARE' },
      { name: 'Critical Strike', description: '15% chance to deal double damage', effectType: 'TRIGGER', effectData: { critChance: 0.15, critMultiplier: 2.0 }, rarity: 'COMMON' },
      { name: 'Elemental Mastery', description: 'Boosts same-element move damage by 25%', effectType: 'PASSIVE', effectData: { elementBoost: 1.25 }, rarity: 'LEGENDARY' },
      { name: 'Lightning Reflexes', description: 'Always goes first in battle', effectType: 'PASSIVE', effectData: { priority: 999 }, rarity: 'LEGENDARY' },
      { name: 'Intimidate', description: 'Reduces enemy attack by 20% on entry', effectType: 'TRIGGER', effectData: { enemyAttackReduction: 0.2 }, rarity: 'RARE' },
      { name: 'Sturdy', description: 'Survives with 1 HP if hit by fatal blow', effectType: 'TRIGGER', effectData: { surviveFatal: true }, rarity: 'LEGENDARY' },
      { name: 'Poison Touch', description: '30% chance to poison enemy on contact', effectType: 'TRIGGER', effectData: { poisonChance: 0.3, poisonDamage: 10 }, rarity: 'COMMON' },
      { name: 'Flame Body', description: 'Burns attackers for 15 damage', effectType: 'TRIGGER', effectData: { burnDamage: 15 }, rarity: 'RARE' },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Database seeded successfully!')
  console.log(`📊 Created ${moves.count} moves and ${abilities.count} abilities`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })