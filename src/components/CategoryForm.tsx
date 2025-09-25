import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Category, localStorageService } from '@/services/localStorageService';
import { toast } from '@/hooks/use-toast';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category;
  onSave: () => void;
}

export default function CategoryForm({ isOpen, onClose, category, onSave }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description
      });
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required.",
        variant: "destructive"
      });
      return;
    }

    if (category) {
      localStorageService.updateCategory(category.id, formData);
      toast({
        title: "Category Updated",
        description: "Category has been updated successfully.",
      });
    } else {
      localStorageService.addCategory(formData);
      toast({
        title: "Category Added",
        description: "Category has been added successfully.",
      });
    }

    onSave();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Add Category'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this category..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {category ? 'Update' : 'Add'} Category
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}