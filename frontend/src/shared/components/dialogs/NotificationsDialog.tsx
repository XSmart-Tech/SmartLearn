import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/shared/store'
import { updateNotification } from '@/shared/store/notificationsSlice'
import { createCard } from '@/shared/store/cardsSlice'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Button,
    Badge,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Alert,
    AlertDescription,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
} from '@/shared/ui'
import { Bell, Check, X } from 'lucide-react'
import type { Notification } from '@/shared/lib/types'
import { getUserCacheFirst } from '@/shared/store/libraryUsersSlice'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface NotificationsDialogProps {
    trigger?: React.ReactNode
}

export default function NotificationsDialog({ trigger }: NotificationsDialogProps) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const [senderNames, setSenderNames] = useState<Record<string, string>>({})
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')
    const dispatch = useDispatch<AppDispatch>()
    const user = useSelector((state: RootState) => state.auth.user)
    const allNotifications = useSelector((state: RootState) => state.notifications.items)

    // Filter notifications based on active tab
    const receivedNotifications = allNotifications.filter(n => n.recipientId === user?.uid)
    const sentNotifications = allNotifications.filter(n => n.senderId === user?.uid)
    const notifications = activeTab === 'received' ? receivedNotifications : sentNotifications

    console.log('[DEBUG] NotificationsDialog - User UID:', user?.uid)
    console.log('[DEBUG] NotificationsDialog - All notifications:', allNotifications.length, allNotifications.map(n => ({ id: n.id, recipientId: n.recipientId, senderId: n.senderId, status: n.status })))
    console.log('[DEBUG] NotificationsDialog - Received notifications:', receivedNotifications.length)
    console.log('[DEBUG] NotificationsDialog - Sent notifications:', sentNotifications.length)
    console.log('[DEBUG] NotificationsDialog - Current notifications:', notifications.length)

    useEffect(() => {
        const fetchNames = async () => {
            const uniqueIds = new Set<string>()
            
            // Add sender IDs from received notifications
            receivedNotifications.forEach(n => uniqueIds.add(n.senderId))
            // Add recipient IDs from sent notifications  
            sentNotifications.forEach(n => uniqueIds.add(n.recipientId))
            
            const names: Record<string, string> = {}
            
            for (const uid of uniqueIds) {
                if (!senderNames[uid]) {
                    const userInfo = await getUserCacheFirst(uid)
                    names[uid] = userInfo?.displayName || userInfo?.email || uid
                }
            }
            
            if (Object.keys(names).length > 0) {
                setSenderNames(prev => ({ ...prev, ...names }))
            }
        }
        
        if (allNotifications.length > 0) {
            fetchNames()
        }
    }, [allNotifications, receivedNotifications, sentNotifications, senderNames])

    if (!user) return null

    const pendingNotifications = notifications.filter(n => n.status === 'pending')

    const handleAccept = async (notification: Notification) => {
        try {
            // Tạo cards
            for (const card of notification.data.cards) {
                await dispatch(createCard({
                    libraryId: notification.libraryId,
                    card: {
                        ...card,
                        libraryId: notification.libraryId
                    }
                })).unwrap()
            }
            // Cập nhật notification
            await dispatch(updateNotification({
                id: notification.id,
                status: 'accepted'
            })).unwrap()
            toast.success(t('notifications.requestAccepted', { count: notification.data.cards.length }))
        } catch (error) {
            console.error('Error accepting notification:', error)
            toast.error(t('notifications.acceptError'))
        }
    }

    const handleReject = async (notification: Notification) => {
        try {
            await dispatch(updateNotification({
                id: notification.id,
                status: 'rejected'
            })).unwrap()
            toast.success(t('notifications.requestRejected'))
        } catch (error) {
            console.error('Error rejecting notification:', error)
            toast.error(t('notifications.rejectError'))
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger ? (
                <div onClick={() => setOpen(true)}>{trigger}</div>
            ) : (
                <Button onClick={() => setOpen(true)} variant="outline">
                    <Bell className="mr-2 h-4 w-4" />
                    {t('common.notifications')}
                    {pendingNotifications.length > 0 && (
                        <Badge variant="destructive" className="ml-2">
                            {pendingNotifications.length}
                        </Badge>
                    )}
                </Button>
            )}
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('notifications.title')}</DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'received' | 'sent')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="received">{t('notifications.received')}</TabsTrigger>
                        <TabsTrigger value="sent">{t('notifications.sent')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="received" className="space-y-4">
                        <div className="space-y-4">
                            {receivedNotifications.filter(n => n.status === 'pending').length === 0 ? (
                                <Alert>
                                    <Bell className="h-4 w-4" />
                                    <AlertDescription>
                                        {t('notifications.noNotifications')}
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                receivedNotifications.filter(n => n.status === 'pending').map((notification) => (
                                    <Card key={notification.id}>
                                        <CardHeader>
                                            <CardTitle className="text-sm">
                                                {t('notifications.addCardsRequest', { count: notification.data.cards.length })}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="text-sm text-muted-foreground">
                                                    Từ: {senderNames[notification.senderId] || notification.senderId}
                                                </div>
                                                <div className="space-y-1">
                                                    {notification.data.cards.slice(0, 3).map((card, index) => (
                                                        <div key={index} className="text-xs bg-muted p-2 rounded">
                                                            <strong>Trước:</strong> {card.front}
                                                            <br />
                                                            <strong>Sau:</strong> {card.back}
                                                        </div>
                                                    ))}
                                                    {notification.data.cards.length > 3 && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {t('common.andMoreCards', { count: notification.data.cards.length - 3 })}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 mt-4">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAccept(notification)}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        <Check className="mr-1 h-3 w-3" />
                                                        Chấp nhận
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleReject(notification)}
                                                    >
                                                        <X className="mr-1 h-3 w-3" />
                                                        Từ chối
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="sent" className="space-y-4">
                        <div className="space-y-4">
                            {sentNotifications.length === 0 ? (
                                <Alert>
                                    <Bell className="h-4 w-4" />
                                    <AlertDescription>
                                        {t('notifications.noSentRequests')}
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                sentNotifications.map((notification) => (
                                    <Card key={notification.id}>
                                        <CardHeader>
                                            <CardTitle className="text-sm">
                                                {t('notifications.addCardsRequestShort', { count: notification.data.cards.length })}
                                                <Badge 
                                                    variant={notification.status === 'pending' ? 'secondary' : 
                                                           notification.status === 'accepted' ? 'default' : 'destructive'}
                                                    className="ml-2"
                                                >
                                                    {notification.status === 'pending' ? t('notifications.pending') :
                                                     notification.status === 'accepted' ? t('notifications.accepted') : t('notifications.rejected')}
                                                </Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="text-sm text-muted-foreground">
                                                    Gửi đến: {senderNames[notification.recipientId] || notification.recipientId}
                                                </div>
                                                <div className="space-y-1">
                                                    {notification.data.cards.slice(0, 2).map((card, index) => (
                                                        <div key={index} className="text-xs bg-muted p-2 rounded">
                                                            <strong>Trước:</strong> {card.front}
                                                            <br />
                                                            <strong>Sau:</strong> {card.back}
                                                        </div>
                                                    ))}
                                                    {notification.data.cards.length > 2 && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {t('common.andMoreCards', { count: notification.data.cards.length - 2 })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
