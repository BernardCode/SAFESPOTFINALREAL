import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { theme } from '../theme';
import { checklists } from '../data/checklists';

export default function ChecklistModal({ visible, onClose }) {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderChecklist = (type, items) => (
    <View key={type} style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(type)}
      >
        <Text style={styles.sectionTitle}>
          {type.charAt(0).toUpperCase() + type.slice(1)} Safety
        </Text>
        <Text style={styles.expandIcon}>
          {expandedSection === type ? '−' : '+'}
        </Text>
      </TouchableOpacity>
      
      {expandedSection === type && (
        <View style={styles.sectionContent}>
          {items.map((item, index) => (
            <View key={index} style={styles.checklistItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.checklistText}>{item}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Emergency Checklists</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          {Object.entries(checklists).map(([type, items]) =>
            renderChecklist(type, items)
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  closeText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  expandIcon: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  sectionContent: {
    padding: theme.spacing.md,
    paddingTop: 0,
  },
  checklistItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  bullet: {
    ...theme.typography.body,
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  checklistText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
    lineHeight: 22,
  },
});
