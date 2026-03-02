export const useFileUpload = () => {
    const supabase = useSupabaseClient()
    const loading = ref(false)

    const uploadFile = async (file: File, path: string, bucket: string = 'bucket1') => {
        loading.value = true
        try {
            const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
                upsert: true,
                cacheControl: '3600',
            })

            if (error) throw error

            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
            return { publicUrl, error: null }
        } catch (err: any) {
            console.error('Error uploading file:', err)
            return { publicUrl: null, error: err.message || 'Erro ao fazer upload' }
        } finally {
            loading.value = false
        }
    }

    return { uploadFile, loading }
}
