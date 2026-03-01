import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL! || 'YOUR_SUPABASE_URL_HERE'
const supabaseKey = process.env.SUPABASE_KEY! || 'YOUR_SUPABASE_KEY_HERE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    console.log('Testing Queries...')

    // Test connection
    const { data, error } = await supabase.from('servicos').select('count', { count: 'exact', head: true })
    console.log('Total Servicos count:', data, error)
}

test()
