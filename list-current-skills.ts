
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listCurrentSkills() {
  try {
    const skills = await prisma.skill.findMany({
      select: {
        id: true,
        name: true,
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log(`\n📋 Current Skills in Database (${skills.length} total):\n`)
    console.log('ID\tSkill Name\t\t\t\t\tCategory')
    console.log('=='.repeat(50))
    
    skills.forEach(skill => {
      const truncatedName = skill.name.length > 35 ? 
        skill.name.substring(0, 35) + '...' : 
        skill.name.padEnd(35)
      console.log(`${skill.id}\t${truncatedName}\t${skill.category.name}`)
    })

    // Also create a simple list for comparison
    const skillNames = skills.map(skill => skill.name)
    
    console.log('\n\n📝 Simple list for comparison:')
    skillNames.forEach(name => console.log(`"${name}"`))
    
  } catch (error) {
    console.error('Error fetching skills:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listCurrentSkills()
