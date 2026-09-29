'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TypeIcon } from '@/components/ui/TypeIcon';

// Données démonstration
const properties = [
  { id: '1', name: 'Villa Cocody', type: 'villa', address: 'Cocody Angré, Abidjan', city: 'Cocody', surface: '280 m²', rooms: 5, bedrooms: 4, bathrooms: 3, price: '45 000 000', status: 'disponible', photos: 3, featured: true },
  { id: '2', name: 'Appartement Les Palmiers', type: 'appartement', address: 'Les Palmiers, Cocody', city: 'Cocody', surface: '145 m²', rooms: 3, bedrooms: 2, bathrooms: 2, price: '18 500 000', status: 'disponible', photos: 5, featured: true },
  { id: '3', name: 'Terrain Angré', type: 'terrain', address: 'Angré, Cocody', city: 'Cocody', surface: '500 m²', rooms: '—', bedrooms: '—', bathrooms: '—', price: '12 000 000', status: 'disponible', photos: 2, featured: false },
  { id: '4', name: 'Villa Monte-Carlo', type: 'villa', address: 'Monte-Carlo, Cocody', city: 'Cocody', surface: '350 m²', rooms: 6, bedrooms: 5, bathrooms: 4, price: '68 000 000', status: 'loué', photos: 8, featured: true },
  { id: '5', name: 'Appartement Résidence du Lac', type: 'appartement', address: 'Résidence du Lac, Cocody', city: 'Cocody', surface: '98 m²', rooms: 3, bedrooms: 2, bathrooms: 1, price: '22 000 000', status: 'disponible', photos: 4, featured: false },
  { id: '6', name: 'Local Commercial Cocody Centre', type: 'local', address: 'Cocody Centre', city: 'Cocody', surface: '120 m²', rooms: 1, bedrooms: '—', bathrooms: 1, price: '9 500 000', status: 'en_negociation', photos: 3, featured: false },
  { id: '7', name: 'Villa Angré Residence', type: 'villa', address: 'Angré Residence, Cocody', city: 'Cocody', surface: '420 m²', rooms: 5, bedrooms: 4, bathrooms: 3, price: '55 000 000', status: 'loué', photos: 6, featured: false },
  { id: '8', name: 'Bureau Plateau', type: 'bureau', address: 'Plateau, Abidjan', city: 'Plateau', surface: '85 m²', rooms: 2, bedrooms: '—', bathrooms: 1, price: '3 500 000', status: 'disponible', photos: 2, featured: false },
];

const statuses = ['disponible', 'loué', 'en_negociation', 'vendu', 'reserve'];

export default function PropertiesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = properties.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 font-serif">Biens immobiliers</h2>
          <p className="text-navy-500 mt-1">{properties.length} biens enregistrés</p>
        </div>
        <button className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouveau bien
        </button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Disponibles', count: properties.filter(p => p.status === 'disponible').length, color: 'bg-green-500' },
          { label: 'Loués', count: properties.filter(p => p.status === 'loué').length, color: 'bg-blue-500' },
          { label: 'En négociation', count: properties.filter(p => p.status === 'en_negociation').length, color: 'bg-amber-500' },
          { label: 'Vendus', count: properties.filter(p => p.status === 'vendu').length, color: 'bg-purple-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-navy-100 p-3 flex items-center justify-between">
            <div className="text-xs text-navy-500">{s.label}</div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
              <span className="text-lg font-bold text-navy-900">{s.count}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <svg className="w-4 h-4 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.394 10.394z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un bien..."
            className="input-base pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-base w-auto"
        >
          <option value="all">Tous les statuts</option>
          {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
        </select>
      </div>

      {/* Grille */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((property, index) => (
          <div
            key={property.id}
            className="bg-white rounded-xl border border-navy-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Image placeholder */}
            <div className="h-40 bg-navy-100 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-navy-300">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                </div>
              </div>
              {property.featured && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-400 text-navy-900 text-[10px] font-bold tracking-wider">
                    ★ VEDETTE
                  </span>
                </div>
              )}
              <div className="absolute bottom-2 left-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-sm" style={{
                  background: property.status === 'disponible' ? '#166534' :
                              property.status === 'loué' ? '#1e40af' :
                              property.status === 'en_negociation' ? '#92400e' :
                              property.status === 'vendu' ? '#6b21a8' : '#64748b'
                }}>
                  {property.status === 'disponible' && '●'}
                  {property.status === 'loué' && '●'}
                  {property.status === 'en_negociation' && '●'}
                  {property.status === 'vendu' && '●'}
                  {property.status === 'reserve' && '●'}
                  <span className="ml-1">{property.status.replace('_', ' ')}</span>
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-navy-900 group-hover:text-gold-500 transition-colors">{property.name}</h3>
                  <p className="text-xs text-navy-500 mt-0.5">{property.address}</p>
                </div>
                <div className="text-navy-400">
                  <TypeIcon type={property.type} />
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-navy-600 mb-3">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6V15m-6 6h6" />
                  </svg>
                  {property.surface}
                </span>
                {property.bedrooms !== '—' && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5h18M3 14.5h18M3 18.5h18M4.5 6h15A1.5 1.5 0 0121 7.5v11a1.5 1.5 0 01-1.5 1.5H4.5A1.5 1.5 0 013 19V7.5A1.5 1.5 0 014.5 6z" />
                    </svg>
                    {property.bedrooms} ch.
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.26-0.296 2.43-0.78 3.441m-0.78-3.441c0-1.26.296-2.43.78-3.441m7.64 6.366a1 1 0 001.414-1.414m-1.707-6.293a1 1 0 01-1.414 0m1.414 1.414a1 1 0 001.414 0m-2.121 2.121a1 1 0 01-1.414 0" />
                  </svg>
                  {property.bathrooms} salle
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-navy-50">
                <span className="text-lg font-bold text-navy-900 font-serif">
                  {property.price} <span className="text-sm font-normal text-navy-500">FCFA</span>
                </span>
                <button className="text-xs text-gold-500 hover:text-gold-600 font-medium">Voir →</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center bg-white rounded-xl border border-navy-100">
          <svg className="w-12 h-12 mx-auto text-navy-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
          </svg>
          <p className="text-navy-500">Aucun bien trouvé</p>
        </div>
      )}
    </div>
  );
}
