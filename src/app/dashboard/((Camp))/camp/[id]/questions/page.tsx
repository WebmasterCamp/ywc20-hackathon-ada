'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

type Question = {
  id: string;
  question: string;
  type: 'text' | 'choice' | 'file';
  required: boolean;
  choices?: string[];
};

type DefaultQuestion = {
  id: string;
  label: string;
  type: 'text' | 'date';
  required: boolean;
  enabled: boolean;
};

const defaultQuestions: DefaultQuestion[] = [
  {
    id: 'name',
    label: 'ชื่อ-นามสกุล',
    type: 'text',
    required: true,
    enabled: true,
  },
  {
    id: 'birthdate',
    label: 'วันเกิด',
    type: 'date',
    required: true,
    enabled: true,
  },
  {
    id: 'allergies',
    label: 'ยาที่แพ้',
    type: 'text',
    required: false,
    enabled: false,
  },
  {
    id: 'food_allergies',
    label: 'อาหารที่แพ้',
    type: 'text',
    required: false,
    enabled: false,
  },
  {
    id: 'grade',
    label: 'ชั้นเรียน',
    type: 'text',
    required: true,
    enabled: true,
  },
  {
    id: 'school',
    label: 'โรงเรียน',
    type: 'text',
    required: true,
    enabled: true,
  },
  {
    id: 'introduction',
    label: 'แนะนำตัวเอง',
    type: 'text',
    required: true,
    enabled: true,
  },
  {
    id: 'activities',
    label: 'กิจกรรมที่เคยทำ',
    type: 'text',
    required: true,
    enabled: true,
  },
];

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      question: 'ทำไมคุณถึงสนใจเข้าร่วมค่ายนี้?',
      type: 'text',
      required: true,
    },
    {
      id: '2',
      question: 'คุณมีประสบการณ์ในการพัฒนาเว็บไซต์หรือไม่?',
      type: 'choice',
      required: true,
      choices: ['ไม่มี', 'มีเล็กน้อย', 'มีประสบการณ์'],
    },
  ]);

  const [defaultQuestionsState, setDefaultQuestionsState] = useState<DefaultQuestion[]>(defaultQuestions);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    type: 'text',
    required: true,
  });

  const handleAddQuestion = () => {
    if (editingQuestion) {
      setQuestions(questions.map(q => 
        q.id === editingQuestion.id ? { ...newQuestion, id: q.id } as Question : q
      ));
    } else {
      setQuestions([...questions, { ...newQuestion, id: Date.now().toString() } as Question]);
    }
    setIsDialogOpen(false);
    setEditingQuestion(null);
    setNewQuestion({ type: 'text', required: true });
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setNewQuestion(question);
    setIsDialogOpen(true);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleAddChoice = () => {
    setNewQuestion({
      ...newQuestion,
      choices: [...(newQuestion.choices || []), ''],
    });
  };

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...(newQuestion.choices || [])];
    newChoices[index] = value;
    setNewQuestion({
      ...newQuestion,
      choices: newChoices,
    });
  };

  const handleRemoveChoice = (index: number) => {
    const newChoices = [...(newQuestion.choices || [])];
    newChoices.splice(index, 1);
    setNewQuestion({
      ...newQuestion,
      choices: newChoices,
    });
  };

  const handleDefaultQuestionToggle = (id: string) => {
    setDefaultQuestionsState(prev =>
      prev.map(q => q.id === id ? { ...q, enabled: !q.enabled } : q)
    );
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 bg-gray-100 py-4 -mx-4 px-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">คำถามค่าย</h3>
            <p className="text-sm text-muted-foreground">
              จัดการคำถามสำหรับผู้สมัครเข้าร่วมค่าย
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              // TODO: Implement save functionality
              console.log('Saving questions:', {
                defaultQuestions: defaultQuestionsState,
                customQuestions: questions
              });
            }}>
              บันทึก
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  เพิ่มคำถาม
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingQuestion ? 'แก้ไขคำถาม' : 'เพิ่มคำถามใหม่'}</DialogTitle>
                  <DialogDescription>
                    กำหนดคำถามและประเภทของคำถามที่ต้องการให้ผู้สมัครตอบ
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="question">คำถาม</Label>
                    <Textarea
                      id="question"
                      value={newQuestion.question || ''}
                      onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                      placeholder="กรอกคำถามที่ต้องการถามผู้สมัคร"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">ประเภทคำถาม</Label>
                    <Select
                      value={newQuestion.type}
                      onValueChange={(value: 'text' | 'choice' | 'file') =>
                        setNewQuestion({ ...newQuestion, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภทคำถาม" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">ข้อความ</SelectItem>
                        <SelectItem value="choice">ตัวเลือก</SelectItem>
                        <SelectItem value="file">ไฟล์</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newQuestion.type === 'choice' && (
                    <div className="grid gap-2">
                      <Label>ตัวเลือก</Label>
                      {(newQuestion.choices || []).map((choice, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={choice}
                            onChange={(e) => handleChoiceChange(index, e.target.value)}
                            placeholder={`ตัวเลือกที่ ${index + 1}`}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveChoice(index)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={handleAddChoice}
                        className="mt-2"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        เพิ่มตัวเลือก
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="required"
                      checked={newQuestion.required}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, required: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="required">บังคับตอบ</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={handleAddQuestion}>
                    {editingQuestion ? 'บันทึกการแก้ไข' : 'เพิ่มคำถาม'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Default Questions Section */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
          <CardDescription>
            เลือกข้อมูลพื้นฐานที่ต้องการให้ผู้สมัครกรอก
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {defaultQuestionsState.map((question) => (
              <div key={question.id} className="flex items-center space-x-2">
                <Checkbox
                  id={question.id}
                  checked={question.enabled}
                  onCheckedChange={() => handleDefaultQuestionToggle(question.id)}
                />
                <Label
                  htmlFor={question.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {question.label}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Custom Questions Section */}
      <div>
        <h4 className="text-lg font-medium mb-4">คำถามเพิ่มเติม</h4>
        <div className="grid gap-4">
          {questions.map((question) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{question.question}</CardTitle>
                    <CardDescription>
                      {question.type === 'text' && 'ข้อความ'}
                      {question.type === 'choice' && 'ตัวเลือก'}
                      {question.type === 'file' && 'ไฟล์'}
                      {question.required && ' • บังคับตอบ'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditQuestion(question)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {question.type === 'choice' && question.choices && (
                <CardContent>
                  <div className="grid gap-2">
                    {question.choices.map((choice, index) => (
                      <div
                        key={index}
                        className="text-sm text-muted-foreground"
                      >
                        • {choice}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 