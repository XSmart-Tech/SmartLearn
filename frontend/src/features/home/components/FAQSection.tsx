import { Card, CardContent, H3, P } from '@/shared/ui'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/shared/ui'
import { useTranslation } from 'react-i18next'

export function FAQSection() {
  const { t } = useTranslation()

  return (
    <Card className="rounded-2xl border bg-white p-6 shadow-sm">
      <CardContent>
        <H3 className="mb-3">Câu hỏi thường gặp</H3>
        <div className="space-y-2">
          <Collapsible>
            <div className="group rounded-md border p-3">
              <CollapsibleTrigger className="cursor-pointer font-medium">
                Tôi có thể dùng khi offline?
              </CollapsibleTrigger>
              <CollapsibleContent>
                <P className="mt-2 text-muted-foreground">
                  Có. Ứng dụng lưu cục bộ và tự đồng bộ khi có mạng.
                </P>
              </CollapsibleContent>
            </div>
          </Collapsible>

          <Collapsible>
            <div className="group rounded-md border p-3">
              <CollapsibleTrigger className="cursor-pointer font-medium">
                SRS hoạt động thế nào?
              </CollapsibleTrigger>
              <CollapsibleContent>
                <P className="mt-2 text-muted-foreground">
                  Bạn sẽ được nhắc ôn theo khoảng cách tăng dần dựa trên mức nhớ.
                </P>
              </CollapsibleContent>
            </div>
          </Collapsible>

          <Collapsible>
            <div className="group rounded-md border p-3">
              <CollapsibleTrigger className="cursor-pointer font-medium">
                {t('home.faqSharing')}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <P className="mt-2 text-muted-foreground">{t('home.faqSharingAnswer')}</P>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  )
}
