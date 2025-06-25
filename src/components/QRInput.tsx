
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Upload, Link, Smartphone, Wifi, CreditCard, Mail, MessageSquare, User, QrCode, FileText } from 'lucide-react';
import { generateVCard, generateWiFi, generateUPI, generateSMS, generateEmail } from '@/utils/qrGenerator';
import { readFileAsDataURL } from '@/utils/fileHandler';

interface QRInputProps {
  onGenerate: (content: string, type: string) => void;
  isLoading: boolean;
}

export const QRInput: React.FC<QRInputProps> = ({ onGenerate, isLoading }) => {
  const [activeTab, setActiveTab] = useState('url');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  
  // Contact form
  const [contact, setContact] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    organization: '',
    url: ''
  });

  // WiFi form
  const [wifi, setWifi] = useState({
    ssid: '',
    password: '',
    security: 'WPA' as 'WPA' | 'WEP' | 'nopass',
    hidden: false
  });

  // UPI form
  const [upi, setUpi] = useState({
    payeeId: '',
    payeeName: '',
    amount: '',
    currency: 'INR',
    note: ''
  });

  // SMS form
  const [sms, setSms] = useState({
    phone: '',
    message: ''
  });

  // Email form
  const [email, setEmail] = useState({
    to: '',
    subject: '',
    body: ''
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileAsDataURL(file);
      setFileContent(content);
      setFileName(file.name);
    } catch (error) {
      console.error('Error reading file:', error);
    }
  };

  const handleSetQRContent = () => {
    let content = '';
    let type = activeTab;

    switch (activeTab) {
      case 'url':
        content = urlInput.trim();
        break;
      case 'text':
        content = textInput.trim();
        break;
      case 'file':
        content = fileContent;
        break;
      case 'contact':
        content = generateVCard(contact);
        break;
      case 'wifi':
        content = generateWiFi(wifi);
        break;
      case 'upi':
        content = generateUPI({
          ...upi,
          amount: upi.amount ? parseFloat(upi.amount) : undefined
        });
        break;
      case 'sms':
        content = generateSMS(sms);
        break;
      case 'email':
        content = generateEmail(email);
        break;
    }

    console.log('Setting QR content:', { content, type });
    
    if (content.trim()) {
      onGenerate(content, type);
    }
  };

  const getContent = () => {
    switch (activeTab) {
      case 'url':
        return urlInput.trim();
      case 'text':
        return textInput.trim();
      case 'file':
        return fileContent;
      case 'contact':
        return contact.firstName || contact.lastName || contact.phone || contact.email;
      case 'wifi':
        return wifi.ssid;
      case 'upi':
        return upi.payeeId || upi.payeeName;
      case 'sms':
        return sms.phone || sms.message;
      case 'email':
        return email.to;
      default:
        return '';
    }
  };

  const hasContent = !!getContent();

  const tabsConfig = [
    { id: 'url', label: 'URL', icon: Link },
    { id: 'text', label: 'Text', icon: FileText },
    { id: 'file', label: 'File', icon: Upload },
    { id: 'contact', label: 'Contact', icon: User },
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'upi', label: 'UPI', icon: CreditCard },
    { id: 'sms', label: 'SMS', icon: MessageSquare },
    { id: 'email', label: 'Email', icon: Mail },
  ];

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 gap-1 h-auto p-1 bg-purple-50 dark:bg-purple-950/30">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="flex items-center gap-1 text-xs px-2 py-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all duration-300 hover:bg-purple-100 dark:hover:bg-purple-900/50"
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="url" className="space-y-3">
          <Label htmlFor="url" className="text-sm font-semibold">Website URL</Label>
          <Input
            id="url"
            placeholder="https://example.com"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="text-base border-purple-200 dark:border-purple-700 focus:border-purple-500 transition-colors duration-300"
          />
        </TabsContent>

        <TabsContent value="text" className="space-y-3">
          <Label htmlFor="text" className="text-sm font-semibold">Text Content</Label>
          <Textarea
            id="text"
            placeholder="Enter any text..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={4}
            className="text-base border-purple-200 dark:border-purple-700 focus:border-purple-500 transition-colors duration-300"
          />
        </TabsContent>

        <TabsContent value="file" className="space-y-3">
          <Label className="text-sm font-semibold">Upload File</Label>
          <Card className="border-dashed border-2 border-purple-300 dark:border-purple-600 p-4 hover:border-purple-500 transition-colors duration-300">
            <div className="text-center">
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-purple-500" />
              <Input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild className="hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors duration-300">
                  <span>Choose File</span>
                </Button>
              </Label>
              {fileName && (
                <p className="text-sm text-muted-foreground mt-2 font-medium">
                  Selected: {fileName}
                </p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="firstName" className="text-sm font-semibold">First Name</Label>
              <Input
                id="firstName"
                value={contact.firstName}
                onChange={(e) => setContact({ ...contact, firstName: e.target.value })}
                className="text-base border-purple-200 dark:border-purple-700 focus:border-purple-500 transition-colors duration-300"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm font-semibold">Last Name</Label>
              <Input
                id="lastName"
                value={contact.lastName}
                onChange={(e) => setContact({ ...contact, lastName: e.target.value })}
                className="text-base border-purple-200 dark:border-purple-700 focus:border-purple-500 transition-colors duration-300"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="phone" className="text-sm font-semibold">Phone</Label>
            <Input
              id="phone"
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              className="text-base border-purple-200 dark:border-purple-700 focus:border-purple-500 transition-colors duration-300"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
            <Input
              id="email"
              type="email"
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              className="text-base border-purple-200 dark:border-purple-700 focus:border-purple-500 transition-colors duration-300"
            />
          </div>
          <div>
            <Label htmlFor="organization" className="text-sm font-semibold">Organization</Label>
            <Input
              id="organization"
              value={contact.organization}
              onChange={(e) => setContact({ ...contact, organization: e.target.value })}
              className="text-base border-purple-200 dark:border-purple-700 focus:border-purple-500 transition-colors duration-300"
            />
          </div>
        </TabsContent>

        <TabsContent value="wifi" className="space-y-3">
          <div>
            <Label htmlFor="ssid" className="text-sm font-semibold">Network Name (SSID)</Label>
            <Input
              id="ssid"
              value={wifi.ssid}
              onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
              className="text-base border-purple-200 dark:border-purple-700 focus:border-purple-500 transition-colors duration-300"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
            <Input
              id="password"
              type="password"
              value={wifi.password}
              onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
              className="text-base border-purple-200 dark:border-purple-700 focus:border-purple-500 transition-colors duration-300"
            />
          </div>
          <div>
            <Label htmlFor="security" className="text-sm font-semibold">Security Type</Label>
            <Select value={wifi.security} onValueChange={(value: 'WPA' | 'WEP' | 'nopass') => setWifi({ ...wifi, security: value })}>
              <SelectTrigger className="border-purple-200 dark:border-purple-700 focus:border-purple-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WPA">WPA/WPA2</SelectItem>
                <SelectItem value="WEP">WEP</SelectItem>
                <SelectItem value="nopass">Open</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="upi" className="space-y-3">
          <div>
            <Label htmlFor="payeeId" className="text-sm font-semibold">UPI ID</Label>
            <Input
              id="payeeId"
              placeholder="username@upi"
              value={upi.payeeId}
              onChange={(e) => setUpi({ ...upi, payeeId: e.target.value })}
              className="text-base border-purple-200 dark:border-purple-700 focus:border-purple-500 transition-colors duration-300"
            />
          </div>
          <div>
            <Label htmlFor="payeeName" className="text-sm font-semibold">Payee Name</Label>
            <Input
              id="payeeName"
              value={upi.payeeName}
              onChange={(e) => setUpi({ ...upi, payeeName: e.target.value })}
              className="text-base border-purple-200 dark:border-purple-700 focus:border-purple-500 transition-colors duration-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="amount" className="text-sm font-semibold">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={upi.amount}
                onChange={(e) => setUpi({ ...upi, amount: e.target.value })}
                className="text-base border-purple-200 dark:border-purple-700 focus:border-purple-500 transition-colors duration-300"
              />
            </div>
            <div>
              <Label htmlFor="currency" className="text-sm font-semibold">Currency</Label>
              <Select value={upi.currency} onValueChange={(value) => setUpi({ ...upi, currency: value })}>
                <SelectTrigger className="border-purple-200 dark:border-purple-700 focus:border-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="note" className="text-sm font-semibold">Note</Label>
            <Input
              id="note"
              value={upi.note}
              onChange={(e) => setUpi({ ...upi, note: e.target.value })}
              className="text-base border-purple-200 dark:border-purple-700 focus:border-purple-500 transition-colors duration-300"
            />
          </div>
        </TabsContent>

        <TabsContent value="sms" className="space-y-3">
          <div>
            <Label htmlFor="smsPhone" className="text-sm font-semibold">Phone Number</Label>
            <Input
              id="smsPhone"
              value={sms.phone}
              onChange={(e) => setSms({ ...sms, phone: e.target.value })}
              className="text-base border-purple-200 dark:border-purple-700 focus:border-purple-500 transition-colors duration-300"
            />
          </div>
          <div>
            <Label htmlFor="smsMessage" className="text-sm font-semibold">Message</Label>
            <Textarea
              id="smsMessage"
              value={sms.message}
              onChange={(e) => setSms({ ...sms, message: e.target.value })}
              rows={3}
              className="text-base border-purple-200 dark:border-purple-700 focus:border-purple-500 transition-colors duration-300"
            />
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-3">
          <div>
            <Label htmlFor="emailTo" className="text-sm font-semibold">To</Label>
            <Input
              id="emailTo"
              type="email"
              value={email.to}
              onChange={(e) => setEmail({ ...email, to: e.target.value })}
              className="text-base border-purple-200 dark:border-purple-700 focus:border-purple-500 transition-colors duration-300"
            />
          </div>
          <div>
            <Label htmlFor="emailSubject" className="text-sm font-semibold">Subject</Label>
            <Input
              id="emailSubject"
              value={email.subject}
              onChange={(e) => setEmail({ ...email, subject: e.target.value })}
              className="text-base border-purple-200 dark:border-purple-700 focus:border-purple-500 transition-colors duration-300"
            />
          </div>
          <div>
            <Label htmlFor="emailBody" className="text-sm font-semibold">Body</Label>
            <Textarea
              id="emailBody"
              value={email.body}
              onChange={(e) => setEmail({ ...email, body: e.target.value })}
              rows={3}
              className="text-base border-purple-200 dark:border-purple-700 focus:border-purple-500 transition-colors duration-300"
            />
          </div>
        </TabsContent>
      </Tabs>

      {hasContent && (
        <Button 
          onClick={handleSetQRContent}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-emerald-500/25 transition-all duration-300" 
          disabled={isLoading}
        >
          Set QR Content
        </Button>
      )}
    </div>
  );
};
