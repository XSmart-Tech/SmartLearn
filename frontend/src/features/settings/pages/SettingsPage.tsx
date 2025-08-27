import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setTheme } from '@/shared/store/themeSlice'
import type { ThemeMode } from '@/shared/store/themeSlice'
import type { RootState, AppDispatch } from '@/shared/store'
import { toast } from 'sonner'
import {
    Label,
    Button,
    Select,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectContent,
    Card,
    CardContent,
    Container,
} from '@/shared/ui'
import { Sun, Moon, Laptop } from 'lucide-react'
import PageHeader from '@/shared/components/PageHeader'

export default function SettingsPage() {
    const reduxTheme = useSelector((s: RootState) => s.theme.mode)
    const dispatch = useDispatch<AppDispatch>()
    const [theme, setThemeState] = useState<ThemeMode>(reduxTheme ?? 'system')

    useEffect(() => {
        setThemeState(reduxTheme)
    }, [reduxTheme])


    function save() {
            // apply and persist theme via next-themes
            // dispatch to redux - ThemeManager will apply and persist
            try {
                dispatch(setTheme(theme as ThemeMode))
                toast.success(`Theme set to ${theme}`)
            } catch (e) {
                console.error('Failed to dispatch theme', e)
                toast.error('Failed to save theme')
            }

            console.log('save settings', { theme })
    }

    return (
        <Container className="space-y-4">
            <PageHeader
                title="Cài đặt"
                description="Tùy chỉnh cài đặt ứng dụng của bạn"
            />

            <div className="space-y-6">

                {/* Appearance Section */}
                <Card className="shadow-lg">
                   
                    <CardContent>
                        <div className="max-w-xs sm:max-w-sm">
                            <Label>Theme</Label>
                            <div className="mt-2">
                                <Select value={theme} onValueChange={val => setThemeState(val as ThemeMode)}>
                                    <SelectTrigger aria-label="Theme">
                                        <SelectValue placeholder="Select theme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">
                                            <div className="flex items-center gap-2">
                                                <Sun size={18} /> Light
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="dark">
                                            <div className="flex items-center gap-2">
                                                <Moon size={18} /> Dark
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="system">
                                            <div className="flex items-center gap-2">
                                                <Laptop size={18} /> System
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8 flex justify-end">
                <Button onClick={save} className="bg-primary text-white hover:bg-primary-dark transition">
                    Save Changes
                </Button>
            </div>
        </Container>
    )
}
