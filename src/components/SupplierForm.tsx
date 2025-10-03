import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Supplier {
  id: string;
  name: string;
  email?: string;
  contact: string;
  address?: string;
}

interface SupplierFormProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier;
  onSave: () => void;
}

export default function SupplierForm({ isOpen, onClose, supplier, onSave }: SupplierFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    address: ''
  });

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        email: supplier.email || '',
        contact: supplier.contact,
        address: supplier.address || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        contact: '',
        address: ''
      });
    }
  }, [supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.contact.trim()) {
      toast({
        title: "Error",
        description: "Name and contact are required fields.",
        variant: "destructive"
      });
      return;
    }

    // Basic email validation if provided
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Error",
          description: "Please enter a valid email address.",
          variant: "destructive"
        });
        return;
      }
    }

    const supplierData = {
      name: formData.name,
      email: formData.email || null,
      contact: formData.contact,
      address: formData.address || null
    };

    try {
      if (supplier) {
        const { error } = await supabase
          .from('suppliers')
          .update(supplierData)
          .eq('id', supplier.id);
        
        if (error) throw error;
        
        toast({
          title: "Supplier Updated",
          description: "Supplier has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('suppliers')
          .insert(supplierData);
        
        if (error) throw error;
        
        toast({
          title: "Supplier Added",
          description: "Supplier has been added successfully.",
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving supplier:', error);
      toast({
        title: "Error",
        description: "Failed to save supplier.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{supplier ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Supplier Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="contact">Contact *</Label>
            <Input
              id="contact"
              type="tel"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter supplier address..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {supplier ? 'Update' : 'Add'} Supplier
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}