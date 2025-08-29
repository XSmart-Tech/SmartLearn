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
import { PageHeader } from '@/shared/components'
import { useTranslation } from 'react-i18next'

export default function SettingsPage() {
    const reduxTheme = useSelector((s: RootState) => s.theme.mode)
    const dispatch = useDispatch<AppDispatch>()
    const [theme, setThemeState] = useState<ThemeMode>(reduxTheme ?? 'system')
    const { t, i18n } = useTranslation()
    const [language, setLanguageState] = useState<string>(i18n.language || 'en')

    const languages = [
        { code: 'en', name: t('settings.english'), flag: '🇺🇸' },
        { code: 'vi', name: t('settings.vietnamese'), flag: '🇻🇳' },
    ]

    useEffect(() => {
        setThemeState(reduxTheme)
    }, [reduxTheme])

    const handleLanguageChange = (languageCode: string) => {
        setLanguageState(languageCode)
        i18n.changeLanguage(languageCode)
        toast.success(`${t('settings.language')} ${t('common.save').toLowerCase()} ${languages.find(lang => lang.code === languageCode)?.name}`)
    }


    function save() {
            // apply and persist theme via next-themes
            // dispatch to redux - ThemeManager will apply and persist
            try {
                dispatch(setTheme(theme as ThemeMode))
                toast.success(`${t('settings.theme')} ${t('common.save').toLowerCase()} ${theme}`)
            } catch (e) {
                console.error('Failed to dispatch theme', e)
                toast.error(t('common.error'))
            }

            console.log('save settings', { theme })
    }

    return (
        <Container className="space-y-4">
            <PageHeader
                title={t('settings.title')}
                description={t('settings.description')}
            />

            <div className="space-y-6">

                {/* Language Section */}
                <Card className="shadow-lg">
                    <CardContent>
                        <div className="max-w-xs sm:max-w-sm">
                            <Label>{t('settings.language')}</Label>
                            <div className="mt-2">
                                <Select value={language} onValueChange={handleLanguageChange}>
                                    <SelectTrigger aria-label={t('settings.language')}>
                                        <SelectValue placeholder={t('settings.language')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {languages.map((lang) => (
                                            <SelectItem key={lang.code} value={lang.code}>
                                                <div className="flex items-center gap-2">
                                                    <span>{lang.flag}</span> {lang.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Appearance Section */}
                <Card className="shadow-lg">
                   
                    <CardContent>
                        <div className="max-w-xs sm:max-w-sm">
                            <Label>{t('settings.theme')}</Label>
                            <div className="mt-2">
                                <Select value={theme} onValueChange={val => setThemeState(val as ThemeMode)}>
                                    <SelectTrigger aria-label={t('settings.theme')}>
                                        <SelectValue placeholder={t('settings.selectTheme')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">
                                            <div className="flex items-center gap-2">
                                                <Sun size={18} /> {t('settings.light')}
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="dark">
                                            <div className="flex items-center gap-2">
                                                <Moon size={18} /> {t('settings.dark')}
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="system">
                                            <div className="flex items-center gap-2">
                                                <Laptop size={18} /> {t('settings.system')}
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
                <Button onClick={save} className="bg-primary text-primary-foreground hover:bg-primary/90 transition">
                    {t('common.save')}
                </Button>
            </div>
        </Container>
    )
}
