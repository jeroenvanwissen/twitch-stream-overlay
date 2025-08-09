import { setVisibility } from '@/store/visibility'
import type { Reward } from '@/types/chat'

interface RewardNameStorage {}

const reward: Reward<RewardNameStorage> = {
  name: 'seagull',
  id: 'bf7045ff-50ca-46eb-9bc9-677423cd6596',
  storage: {},
  init: () => {},
  callback: async () => {
    setVisibility('seagull', true)
    setTimeout(() => {
      setVisibility('seagull', false)
    }, 60000)
  }
}

export default reward