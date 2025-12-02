import { Mentor } from '../models/index.js';

export const getAllMentors = async (req, res) => {
  try {
    const { search, specialty, minRating, limit, offset } = req.query;
    const mentors = await Mentor.findAll({ search, specialty, minRating, limit, offset });
    res.json({ success: true, data: mentors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar mentores', error: error.message });
  }
};

export const getMentorById = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json({ success: false, message: 'Mentor não encontrado' });

    res.json({ success: true, data: mentor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar mentor', error: error.message });
  }
};

export const updateMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json({ success: false, message: 'Mentor não encontrado' });
    if (mentor.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Sem permissão' });
    }

    const { bio, experience, hourlyRate, specialties, languages, certifications, avatar, profileImageUrl } = req.body;

    await Mentor.update(req.params.id, {
      bio: bio || mentor.bio,
      experience: experience !== undefined ? experience : mentor.experience,
      hourlyRate: hourlyRate !== undefined ? hourlyRate : mentor.hourlyRate,
      specialties,
      languages,
      certifications,
      avatar,
      profileImageUrl
    });

    res.json({ success: true, message: 'Mentor atualizado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar mentor', error: error.message });
  }
};

export const getMentorsBySpecialties = async (req, res) => {
  try {
    const specialties = await Mentor.getAllSpecialties();
    res.json({ success: true, data: specialties });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro', error: error.message });
  }
};
