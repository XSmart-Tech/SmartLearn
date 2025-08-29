import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/shared/store'
import type { Flashcard } from '@/shared/lib/types'
import { createCard } from '@/shared/store/cardsSlice'
import { createNotification } from '@/shared/store/notificationsSlice'
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Textarea,
    Alert,
    AlertDescription
} from '@/shared/ui'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface BulkAddCardsDialogProps {
    libraryId: string
    trigger?: React.ReactNode
}

export default function BulkAddCardsDialog({ libraryId, trigger }: BulkAddCardsDialogProps) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const [text, setText] = useState('')
    const [error, setError] = useState('')
    const dispatch = useDispatch<AppDispatch>()
    const user = useSelector((state: RootState) => state.auth.user)
    const library = useSelector((state: RootState) => state.libraries.items[libraryId])

    const isOwner = user && library && library.ownerId === user.uid
    const isContributor = user && library && library.shareRoles?.[user.uid] === 'contributor'

    const parseCards = (input: string): Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>[] => {
        const lines = input.trim().split('\n').filter(line => line.trim())
        const cards: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>[] = []
        const errors: string[] = []

        lines.forEach((line, index) => {
            const parts = line.split('|').map(p => p.trim())
            if (parts.length < 2) {
                errors.push(`Dòng ${index + 1}: Cần ít nhất front|back`)
                return
            }
            const [front, back, description = ''] = parts
            if (!front || !back) {
                errors.push(`Dòng ${index + 1}: Front và back không được rỗng`)
                return
            }
            cards.push({
                front,
                back,
                description,
                libraryId
            })
        })

        if (errors.length > 0) {
            throw new Error(errors.join('\n'))
        }

        return cards
    }

    const handleSubmit = () => {
        try {
            const cards = parseCards(text)
            if (cards.length === 0) {
                setError('Không có thẻ nào để thêm')
                return
            }

            if (isOwner) {
                // Owner có thể thêm trực tiếp
                cards.forEach(card => {
                    dispatch(createCard({ libraryId, card }))
                })
                setText('')
                setError('')
                setOpen(false)
            } else if (isContributor) {
                // Contributor gửi request
                dispatch(createNotification({
                    type: 'card_request',
                    recipientId: library.ownerId,
                    senderId: user.uid,
                    libraryId,
                    status: 'pending',
                    data: {
                        cards,
                        message: `Yêu cầu thêm ${cards.length} thẻ vào thư viện`
                    }
                }))
                toast.success(`Đã gửi yêu cầu thêm ${cards.length} thẻ đến chủ thư viện`)
                setText('')
                setError('')
                setOpen(false)
            } else {
                // Viewer không có quyền
                setError(t('common.noPermissionToAddCards'))
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : t('common.errorParsingCards'))
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setText('')
            setError('')
        }
        setOpen(newOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {trigger ? (
                <div onClick={() => setOpen(true)}>{trigger}</div>
            ) : (
                <Button onClick={() => setOpen(true)} variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Thêm nhiều thẻ
                </Button>
            )}
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Thêm nhiều thẻ</DialogTitle>
                    <DialogDescription>
                        {isContributor 
                            ? 'Nhập các thẻ theo định dạng: mặt trước|mặt sau|mô tả (mô tả tùy chọn). Yêu cầu sẽ được gửi đến chủ thư viện để phê duyệt.'
                            : 'Nhập các thẻ theo định dạng: mặt trước|mặt sau|mô tả (mô tả tùy chọn). Mỗi thẻ trên một dòng.'
                        }
                        <br />
                        Mỗi thẻ trên một dòng.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <Textarea
                        placeholder={`Ví dụ:
Câu hỏi 1|Trả lời 1|Mô tả tùy chọn
Câu hỏi 2|Trả lời 2
Câu hỏi 3|Trả lời 3|Mô tả khác`}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={10}
                        className="font-mono text-sm"
                    />

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={() => handleOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={!text.trim()}>
                        {isContributor ? 'Gửi yêu cầu' : 'Thêm thẻ'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
