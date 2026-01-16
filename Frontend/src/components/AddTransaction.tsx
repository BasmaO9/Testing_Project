import React, { useState } from 'react';
import { transactionsService } from '../services/transactions.service';
import { Category } from '../types/category';
import { CreateTransactionDTO } from '../types/transaction';

interface AddTransactionProps {
  onTransactionAdded?: () => void; // ✅ callback to trigger refresh
}

const AddTransaction: React.FC<AddTransactionProps> = ({ onTransactionAdded }) => {
  const categories: Category[] = [
    { _id: '674af54da65f08511321ea6d', category: 'Household Expenses', category_img: '' },
    { _id: '674c457fef61f784396a65f4', category: 'entertainment', category_img: '' },
    { _id: '674c457fef61f784396a65f5', category: 'gas_transport', category_img: '' },
    { _id: '674c457fef61f784396a65f6', category: 'misc_pos', category_img: '' },
    { _id: '674c457fef61f784396a65fa', category: 'food_dining', category_img: '' },
    { _id: '674c457fef61f784396a65fd', category: 'travel', category_img: '' },
    { _id: '674c457fef61f784396a65f8', category: 'shopping_net', category_img: '' },
    { _id: '674c457fef61f784396a65f9', category: 'shopping_pos', category_img: '' },
    { _id: '674c457fef61f784396a65fb', category: 'personal_care', category_img: '' },
    { _id: '674c457fef61f784396a65fc', category: 'health_fitness', category_img: '' },
    { _id: '674c457fef61f784396a65fe', category: 'kids_pets', category_img: '' },
    { _id: '674c457fef61f784396a65f2', category: 'misc_net', category_img: '' },
    { _id: '674c457fef61f784396a65f3', category: 'grocery_pos', category_img: '' },
    { _id: '674c457fef61f784396a65ff', category: 'home', category_img: '' },
    { _id: '6752fd44ef61f784396b0a9d', category: 'gifts', category_img: '' },
    { _id: '674c457fef61f784396a65f7', category: 'grocery_net', category_img: '' },
    { _id: '6752fd44ef61f784396b0a9e', category: 'investments', category_img: '' },
    { _id: '6752fd44ef61f784396b0a9f', category: 'selling items', category_img: '' },
    { _id: '6752fd44ef61f784396b0a9c', category: 'salary', category_img: '' },
  ];

  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    category: undefined as Category | undefined,
    amount: 0,
    date: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scanMessage, setScanMessage] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'category') {
      const selectedCategory = categories.find((cat) => cat._id === value);
      setFormData({ ...formData, category: selectedCategory });
    } else if (name === 'amount') {
      setFormData({ ...formData, amount: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setScanMessage('⏳ Scanning receipt...');
      const { amount, date } = await transactionsService.scanReceipt(file);
      setFormData((prev) => ({
        ...prev,
        amount,
        date: date.slice(0, 10),
      }));
      setScanMessage(`✅ Scanned Amount: ${amount}, Date: ${date.slice(0, 10)}`);
    } catch (err) {
      console.error(err);
      setScanMessage('❌ Failed to scan receipt.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.category?._id) {
        setError('Please select a category');
        setLoading(false);
        return;
      }

      const transactionData: CreateTransactionDTO = {
        type: formData.type,
        category: formData.category._id,
        amount: formData.amount,
        date: formData.date,
        description: formData.description || '',
      };

      await transactionsService.addTransaction(transactionData);

      // ✅ Optional callback to notify parent
      if (onTransactionAdded) {
        onTransactionAdded();
      }

      setSuccess('Transaction added successfully!');
      setFormData({
        type: 'income',
        category: undefined,
        amount: 0,
        date: '',
        description: '',
      });
      setScanMessage('');
    } catch (err) {
      setError('Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-transaction-container">
      <div className="add-transaction">
        <h2 className="form-header">Add Transaction</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        {scanMessage && <div className="scan-message">{scanMessage}</div>}

        <form onSubmit={handleSubmit} className="transaction-form">
          <div className="form-group">
            <label htmlFor="receipt" className="form-label">Scan Receipt (optional)</label>
            <input type="file" accept="image/*" onChange={handleReceiptUpload} className="form-control" />
          </div>

          <div className="form-group">
            <label htmlFor="type" className="form-label">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="form-control"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="category" className="form-label">Category</label>
            <select
              name="category"
              value={formData.category?._id || ''}
              onChange={handleInputChange}
              required
              className="form-control"
            >
              <option value="" disabled>Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>{category.category}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="amount" className="form-label">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount || ''}
              onChange={handleInputChange}
              required
              min="0"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="date" className="form-label">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date || ''}
              onChange={handleInputChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Description (Optional)</label>
            <input
              type="text"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Adding...' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;
